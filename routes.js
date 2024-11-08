// routes.js
import express from 'express';
import bcrypt from 'bcryptjs';
import { authenticateToken, authorizeRole, generateToken } from './middleware.js';
import { initDB, getDB } from './db.js';
import moment from 'moment';

const router = express.Router();

let db;

initDB().then((database) => {
  db = database;
});

// Define rate limit and alert thresholds
const MAX_ATTEMPTS = 5;
const ALERT_THRESHOLD = 10;
const TIME_WINDOW_MINUTES = 10;

// Function to check and log excessive failed attempts
async function checkAndAlertExcessiveFailedAttempts(username, ip) {
  const timeWindow = moment().subtract(TIME_WINDOW_MINUTES, 'minutes').toISOString();

  const recentFailedAttempts = await db.all(
    `
      SELECT * FROM login_attempts
      WHERE (username = ? OR ip_address = ?) AND success = 0 AND timestamp > ?
    `,
    [username, ip, timeWindow]
  );

  if (recentFailedAttempts.length >= ALERT_THRESHOLD) {
    console.warn(
      `ALERT: High volume of failed login attempts detected for user: ${username} or IP: ${ip}`
    );
    // Integrate with an alerting service (email, SMS, monitoring tool, etc.)
  }
}


// Helper function to validate username
function isInvalidUsername(username) {
  const minLength = 3;
  const maxLength = 20;
  const containsOnlyValidChars = /^[a-zA-Z0-9._]+$/.test(username);
  const noSequentialOrRepeated = !/(.)\1{2,}/.test(username) && !/123|abc/.test(username);
  const notCommonUsername = !["admin", "user", "guest"].includes(username.toLowerCase());
  const notAllNumbers = !/^\d+$/.test(username);

  return (
    username.length < minLength ||
    username.length > maxLength ||
    !containsOnlyValidChars ||
    !noSequentialOrRepeated ||
    !notCommonUsername ||
    !notAllNumbers
  );
}

// Helper function to validate password
function isWeakPassword(password, username) {
  const minLength = 8;
  const containsUpperCase = /[A-Z]/.test(password);
  const containsLowerCase = /[a-z]/.test(password);
  const containsNumber = /[0-9]/.test(password);
  const containsSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const notUsername = password !== username;
  const noSequentialOrRepeated = !/^(.)\1*$/.test(password) && !/1234|abcd|qwerty|password/.test(password);
  const notCommonPattern = !["password", "123456", "qwerty", "111111"].includes(password.toLowerCase());

  return (
    password.length < minLength ||
    !containsUpperCase ||
    !containsLowerCase ||
    !containsNumber ||
    !containsSpecialChar ||
    !notUsername ||
    !noSequentialOrRepeated ||
    !notCommonPattern
  );
}

router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;

  // Validate username
  if (isInvalidUsername(username)) {
    return res.status(400).json({ 
      message: 'Invalid username! Must be 3-20 characters, alphanumeric, no sequences or repeats, not purely numeric, and not a common name like "admin" or "guest".' 
    });
  }

  // Validate password
  if (isWeakPassword(password, username)) {
    return res.status(400).json({ 
      message: 'Weak password! Password must be at least 8 characters long, contain a mix of upper and lowercase letters, numbers, special characters, and should not be easily guessable.' 
    });
  }

  try {
    // Check for existing username
    const existingUser = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUser) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // Hash password and save user
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [
      username,
      hashedPassword,
      role,
    ]);
    res.status(201).json({ message: 'User created' });
  } catch (error) {
    console.error('Error in /register route:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  const timeWindow = moment().subtract(TIME_WINDOW_MINUTES, 'minutes').toISOString();

  try {
    const recentAttempts = await db.all(
      `
        SELECT * FROM login_attempts
        WHERE (username = ? OR ip_address = ?) AND success = 0 AND timestamp > ?
      `,
      [username, ip, timeWindow]
    );

    if (recentAttempts.length >= MAX_ATTEMPTS) {
      return res.status(429).json({ message: 'Too many login attempts. Please try again later.' });
    }

    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    const loginSuccess = user && (await bcrypt.compare(password, user.password));

    await db.run('INSERT INTO login_attempts (username, success, ip_address) VALUES (?, ?, ?)', [
      username,
      loginSuccess ? 1 : 0,
      ip,
    ]);

    if (!loginSuccess) {
      await checkAndAlertExcessiveFailedAttempts(username, ip);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.json({ token });
  } catch (error) {
    console.error('Error logging login attempt:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/', (req, res) => {
  res.send('Welcome to webshop');
});

router.get('/userpage', authenticateToken, (req, res) => {
  res.json({
    username: req.user.username,
    message: `Welcome user ${req.user.username}`
  });
});

router.get('/adminpage', authenticateToken, authorizeRole('admin'), (req, res) => {
  res.send(`Welcome admin ${req.user.username}`);
});


router.get('/products', async (req, res) => {
  try {
      const products = await db.all('SELECT * FROM products WHERE stock > 0');
      res.json(products);
  } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/basket/add', authenticateToken, async (req, res) => {
  const { productId } = req.body;
  try {
      const product = await db.get('SELECT * FROM products WHERE id = ?', [productId]);
      if (!product || product.stock <= 0) {
          return res.status(400).json({ message: 'Product is out of stock' });
      }

      await db.run('UPDATE products SET stock = stock - 1 WHERE id = ?', [productId]);
      res.json({ message: 'Product added to basket and stock updated' });
  } catch (error) {
      console.error('Error adding to basket:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/books', async (req, res) => {
  try {
    const books = await db.all('SELECT * FROM books');
    res.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



router.post('/add-to-cart', authenticateToken, async (req, res) => {
  const { bookId } = req.body;
  const userId = req.user.id;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is missing from the token' });
  }

  try {
    // Calculate the total quantity of books currently in the cart for this user
    const totalBooksInCart = await db.get(
      'SELECT SUM(quantity) as total FROM cart WHERE user_id = ?',
      [userId]
    );

    // Ensure that the total number of books in the cart does not exceed 4
    if ((totalBooksInCart.total || 0) >= 4) {
      return res.status(400).json({
        message: 'You have reached the total limit of 4 books in your cart.'
      });
    }

    // Check stock availability
    const book = await db.get('SELECT stock FROM books WHERE id = ?', [bookId]);
    if (!book || book.stock < 1) {
      return res.status(400).json({ message: 'Out of stock' });
    }

    // Check if the book is already in the cart
    const existingCartItem = await db.get(
      'SELECT quantity FROM cart WHERE user_id = ? AND book_id = ?',
      [userId, bookId]
    );

    // Calculate the new total quantity if this book is added
    const newTotalQuantity = (totalBooksInCart.total || 0) + 1;

    // If the new total exceeds 4, prevent addition
    if (newTotalQuantity > 4) {
      return res.status(400).json({
        message: 'Adding this book would exceed the total limit of 4 books in your cart.'
      });
    }

    // Update cart in the database, or insert a new row if not existing
    if (existingCartItem) {
      await db.run(
        'UPDATE cart SET quantity = quantity + 1 WHERE user_id = ? AND book_id = ?',
        [userId, bookId]
      );
    } else {
      await db.run(
        'INSERT INTO cart (user_id, book_id, quantity) VALUES (?, ?, 1)',
        [userId, bookId]
      );
    }

    // Deduct 1 from stock in the books table
    await db.run('UPDATE books SET stock = stock - 1 WHERE id = ?', [bookId]);

    // Get updated cart quantity for the user
    const updatedTotalBooks = await db.get(
      'SELECT SUM(quantity) as total FROM cart WHERE user_id = ?',
      [userId]
    );

    res.json({ message: 'Added to cart', cartQuantity: updatedTotalBooks.total });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/cart-quantity', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
      const cartQuantity = await db.get('SELECT SUM(quantity) as total FROM cart WHERE user_id = ?', [userId]);
      res.json({ cartQuantity: cartQuantity ? cartQuantity.total : 0 });
  } catch (error) {
      console.error('Error fetching cart quantity:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});




router.get('/cart', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    // Fetch cart items with book name, price, and quantity
    const cartItems = await db.all(`
      SELECT 
        books.id AS bookId,
        books.title AS name,
        books.price AS price,
        cart.quantity AS quantity
      FROM cart
      JOIN books ON cart.book_id = books.id
      WHERE cart.user_id = ?
    `, [userId]);

    res.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.post('/update-cart-quantity', authenticateToken, async (req, res) => {
  const { bookId, quantity } = req.body;
  const userId = req.user.id;

  if (quantity < 1) {
    return res.status(400).json({ message: 'Quantity must be at least 1' });
  }

  try {
    // Check stock availability
    const book = await db.get('SELECT stock FROM books WHERE id = ?', [bookId]);
    if (!book || book.stock < quantity) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }

    // Update cart quantity if stock is sufficient
    await db.run(
      'UPDATE cart SET quantity = ? WHERE user_id = ? AND book_id = ?',
      [quantity, userId, bookId]
    );

    res.json({ message: 'Cart quantity updated' });
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/remove-from-cart', authenticateToken, async (req, res) => {
  const { bookId } = req.body;
  const userId = req.user.id;

  try {
    // Remove the item from the cart
    await db.run('DELETE FROM cart WHERE user_id = ? AND book_id = ?', [userId, bookId]);
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/feedbacks', authenticateToken, async (req, res) => {
  try {
    const feedbacks = await db.all('SELECT * FROM feedback ORDER BY timestamp DESC');
    res.json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/add-feedback', authenticateToken, async (req, res) => {
  const { content, rating, email } = req.body;
  const userId = req.user.id;
  const username = req.user.username;

  if (!content || !rating) {
    return res.status(400).json({ message: 'Feedback content and rating are required' });
  }

  try {
    await db.run(
      'INSERT INTO feedback (user_id, username, content, rating, email) VALUES (?, ?, ?, ?, ?)',
      [userId, username, content, rating, email]
    );

    res.status(201)
      .set({
        'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' https://trusted-styles-source.com; img-src 'self' data:; connect-src 'self'; font-src 'self' https://trusted-fonts-source.com; object-src 'none'; upgrade-insecure-requests",
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block'
      })
      .json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});






router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

export default router;

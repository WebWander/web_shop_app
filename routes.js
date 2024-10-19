import express from 'express';
import bcrypt from 'bcryptjs';
import { authencateToken, authorizeRole, generateToken } from "./middleware.js";
import { initDB } from "./db.js";

const router = express.Router();
let db;

initDB().then(database => {
    db = database;
});

router.post('/register', async (req, res) => {
    const { name, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('hashedPassword:', hashedPassword);

    try {
        await db.run('INSERT INTO users (name, password, role) VALUES (?, ?, ?)', [name, hashedPassword, role]);
        res.status(201).json({ message: 'User created' });
    } catch (error) {
      console.error('Error in /register route:', error);
        res.status(500).json({ message: 'Internal server error' });
    }

});


router.post('/login', async (req, res) => {
    const { name, password } = req.body;
    const user = await db.get('SELECT * FROM users WHERE name = ?', [name]);

   if (user && await bcrypt.compare(password, user.password)) {
       const token = generateToken(user);
       res.json({ token });
   } else {
       res.status(401).json({ message: 'Invalid credentials' });
   };
   
});


router.get('/', (req, res) => {
  res.send('Welcome to webshop');
});

router.get('/userpage', authencateToken, (req, res) => {
  res.send(`Welcome user ${req.user.name}`);
});

router.get('/adminpage', authencateToken, authorizeRole('admin'), (req, res) => {
  res.send(`Welcome admin ${req.user.name}`);
});

export default router;

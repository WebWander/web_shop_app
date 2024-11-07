// seedBooks.js
import { initDB } from './db.js';

const books = [
  {
    title: "JavaScript: The Good Parts",
    author: "Douglas Crockford",
    description: "An in-depth look at the strengths of JavaScript.",
    price: 29.99,
    category: "Programming",
    stock: 100,
    publicationDate: "2008-05-15"
  },
  {
    title: "Clean Code",
    author: "Robert C. Martin",
    description: "A handbook of agile software craftsmanship.",
    price: 39.99,
    category: "Software Engineering",
    stock: 50,
    publicationDate: "2008-08-01"
  },
  {
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    description: "Comprehensive guide to modern algorithm design and analysis.",
    price: 99.99,
    category: "Computer Science",
    stock: 20,
    publicationDate: "2009-07-31"
  },
  {
    title: "You Don’t Know JS",
    author: "Kyle Simpson",
    description: "An insightful guide to the core mechanisms of JavaScript.",
    price: 24.99,
    category: "Programming",
    stock: 75,
    publicationDate: "2014-12-27"
  },
  {
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt, David Thomas",
    description: "Best practices for software developers.",
    price: 44.99,
    category: "Software Engineering",
    stock: 30,
    publicationDate: "1999-10-20"
  },
  {
    title: "Artificial Intelligence: A Modern Approach",
    author: "Stuart Russell, Peter Norvig",
    description: "Comprehensive overview of AI theory and practice.",
    price: 89.99,
    category: "Artificial Intelligence",
    stock: 15,
    publicationDate: "2009-12-11"
  },
  {
    title: "Deep Learning",
    author: "Ian Goodfellow, Yoshua Bengio, Aaron Courville",
    description: "An essential resource on deep learning techniques.",
    price: 74.99,
    category: "Machine Learning",
    stock: 25,
    publicationDate: "2016-11-18"
  },
  {
    title: "Design Patterns",
    author: "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides",
    description: "A classic guide to reusable object-oriented software design.",
    price: 49.99,
    category: "Software Engineering",
    stock: 10,
    publicationDate: "1994-10-21"
  },
  {
    title: "Python Crash Course",
    author: "Eric Matthes",
    description: "A beginner-friendly guide to Python programming.",
    price: 29.99,
    category: "Programming",
    stock: 80,
    publicationDate: "2015-11-01"
  },
  {
    title: "The Art of Computer Programming",
    author: "Donald E. Knuth",
    description: "One of the most comprehensive works in computer science.",
    price: 199.99,
    category: "Computer Science",
    stock: 5,
    publicationDate: "1968-01-01"
  }
];

const seedBooks = async () => {
  const db = await initDB();
  try {
    for (const book of books) {
      await db.run(
        `INSERT INTO books (title, author, description, price, category, stock, publicationDate) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [book.title, book.author, book.description, book.price, book.category, book.stock, book.publicationDate]
      );
    }
    console.log("Books seeded successfully.");
  } catch (error) {
    console.error("Error seeding books:", error);
  }
};

seedBooks();

// components/BookList.js
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../App'; // Import AuthContext


function BookList() {
    const [books, setBooks] = useState([]);
    const [message, setMessage] = useState('');
    const { incrementCartQuantity, authToken } = useContext(AuthContext); // Access cart quantity updater and authToken

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await axios.get('http://localhost:5000/books');
                setBooks(response.data);
            } catch (error) {
                console.error('Error fetching books:', error);
            }
        };

        fetchBooks();
    }, []);

    const handleAddToCart = async (bookId) => {
        try {
            // Send request to add to cart with quantity = 1
            const response = await axios.post('http://localhost:5000/add-to-cart', 
                { bookId },
                { headers: { Authorization: `Bearer ${authToken}` } }
            );

            // Update stock in the local state after adding to cart
            setBooks(books.map(book => 
                book.id === bookId ? { ...book, stock: book.stock - 1 } : book
            ));

            // Update cart quantity in the header based on backend response
            incrementCartQuantity(response.data.cartQuantity);

            setMessage(response.data.message);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error adding to cart');
            console.error('Error adding to cart:', error);
        }
    };

    // Clear the message after 3 seconds
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    return (
        <div>
            <h2>Available Books</h2>
            {message && <p className="message">{message}</p>}
            <div className="book-list-container">
                {books.map(book => (
                    <div key={book.id} className="book-card">
                        <h3>{book.title}</h3>
                        <p><strong>Author:</strong> {book.author}</p>
                        <p className="price">${book.price.toFixed(2)}</p>
                        <p>{book.description}</p>
                        <p><strong>Category:</strong> {book.category}</p>
                        <p className="stock">
                            {book.stock > 0 
                                ? `${book.stock} copies available` 
                                : "Out of Stock"}
                        </p>
                        <button 
                            onClick={() => handleAddToCart(book.id)} 
                            disabled={book.stock <= 0} // Disable if out of stock
                        >
                            {book.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default BookList;

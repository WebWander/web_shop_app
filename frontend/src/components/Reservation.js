import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';

function Reservation() {
    const { authToken } = useContext(AuthContext);
    const [productId, setProductId] = useState('');
    const [message, setMessage] = useState('');

    const handleReserve = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                '/reserve-product',
                { productId },
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            setMessage(response.data.message);
        } catch (error) {
            setMessage(error.response.data.message || 'Reservation failed');
        }
    };

    return (
        <div>
            <h2>Reserve Product</h2>
            <form onSubmit={handleReserve}>
                <input type="text" placeholder="Product ID" value={productId} onChange={e => setProductId(e.target.value)} required />
                <button type="submit">Reserve</button>
            </form>
            <p>{message}</p>
        </div>
    );
}

export default Reservation;

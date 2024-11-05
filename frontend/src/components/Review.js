import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';

function Review() {
    const { authToken } = useContext(AuthContext);
    const [review, setReview] = useState('');
    const [message, setMessage] = useState('');

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                '/add-review',
                { review },
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            setMessage(response.data.message);
        } catch (error) {
            setMessage('Review submission failed');
        }
    };

    return (
        <div>
            <h2>Submit a Review</h2>
            <form onSubmit={handleReviewSubmit}>
                <textarea placeholder="Write your review here" value={review} onChange={e => setReview(e.target.value)} required />
                <button type="submit">Submit Review</button>
            </form>
            <p>{message}</p>
        </div>
    );
}

export default Review;

import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';

function Feedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackContent, setFeedbackContent] = useState('');
  const [rating, setRating] = useState(1);
  const [contactEmail, setContactEmail] = useState('');
  const { authToken, username } = useContext(AuthContext);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      if (!authToken) return;
      try {
        const response = await axios.get('http://localhost:5000/feedbacks', {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        setFeedbacks(response.data);
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
      }
    };

    fetchFeedbacks();
  }, [authToken]);

  const handleAddFeedback = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:5000/add-feedback',
        { content: feedbackContent, rating, email: contactEmail },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setFeedbacks([{ username, content: feedbackContent, rating, email: contactEmail, timestamp: new Date().toISOString() }, ...feedbacks]);
      setFeedbackContent('');
      setRating(1);
      setContactEmail('');
    } catch (error) {
      console.error('Error adding feedback:', error);
    }
  };

  return (
    <div className="feedback-section">
      <h2>Feedback Form</h2>
      {authToken ? (
        <>
          <form onSubmit={handleAddFeedback}>
            <textarea
              value={feedbackContent}
              onChange={(e) => setFeedbackContent(e.target.value)}
              placeholder="Write your feedback..."
              required
            />
            <div className="rating-section">
              <label>Rating: </label>
              <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </div>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="Your email (optional)"
            />
            <button type="submit">Submit Feedback</button>
          </form>
          <div className="feedback-list">
            {feedbacks.map((feedback, index) => (
              <div key={index} className="feedback">
                <p><strong>{feedback.username}</strong> - Rating: {feedback.rating} - {new Date(feedback.timestamp).toLocaleString()}</p>
                {feedback.email && <p><em>Contact: {feedback.email}</em></p>}
                <p>{feedback.content}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p>Please log in to submit and view feedback.</p>
      )}
    </div>
  );
}

export default Feedback;

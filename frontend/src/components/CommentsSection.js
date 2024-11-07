// components/CommentsSection.js
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';

function CommentsSection({ entityId, entityType }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const { authToken, username } = useContext(AuthContext);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/comments?entityId=${entityId}&entityType=${entityType}`);
                setComments(response.data);
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        };

        fetchComments();
    }, [entityId, entityType]);

    const handleAddComment = async (e) => {
        e.preventDefault();
        console.log('entityId:', entityId, 'entityType:', entityType); // Check values here
        try {
            await axios.post(
                'http://localhost:5000/add-comment',
                { content: newComment },
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            // Add the new comment to the state so it displays immediately
            setComments([{ username, content: newComment, timestamp: new Date().toISOString() }, ...comments]);
            setNewComment(''); // Clear the comment input
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };
    
    return (
        <div className="comments-section">
            <h2>Comments</h2>
            {authToken && (
                <form onSubmit={handleAddComment}>
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        required
                    />
                    <button type="submit">Post Comment</button>
                </form>
            )}
            {/*<div className="comments-list">
                {comments.map((comment, index) => (
                    <div key={index} className="comment">
                        <p><strong>{comment.username}</strong> - {new Date(comment.timestamp).toLocaleString()}</p>
                        <p>{comment.content}</p>
                    </div>
                ))}
            </div>*/}
        </div>
    );
}

export default CommentsSection;

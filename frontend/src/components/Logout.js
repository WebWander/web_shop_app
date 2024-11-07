// src/utils/logoutHelper.js

import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';

export const Logout = () => {
  const { setAuthToken, setUsername } = useContext(AuthContext);
  const navigate = useNavigate();

  // Define the handleLogout function within the hook
  const handleLogout = async () => {
    try {
      // Optional: Make a call to the backend /logout endpoint
      await fetch('http://localhost:5000/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      // Clear authToken and username from context
      setAuthToken(null);
      setUsername(null);

      // Redirect to login or home page
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return handleLogout; 
};

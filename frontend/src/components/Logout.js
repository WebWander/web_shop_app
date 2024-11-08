import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';

export const useLogout = () => {
  const { setAuthToken, setUsername } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
     
      await fetch('http://localhost:5000/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

     
      setAuthToken(null);
      setUsername(null);

      
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return handleLogout;
};

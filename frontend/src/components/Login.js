import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';
import { useNavigate } from 'react-router-dom';

function Login() {
    const { setAuthToken } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(' http://localhost:5000/login', { username, password });
            setAuthToken(response.data.token);
            setUsername(username);
            setMessage('Login successful');
            navigate('/userpage');
        } catch (error) {
            setMessage('Invalid credentials');
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleLogin} style={{marginBottom: '20px'}}>
                <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="submit" className="btn-primary">Login</button>
            </form>
            <p>{message}</p>
            <div></div>
            <div></div>
            <p>New customer?</p>
            <p></p>
            <button onClick={() => navigate('/register')} className="btn-primary">Register</button >
        </div>
    );
}

export default Login;

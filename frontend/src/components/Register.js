// Register.js
import React, { useState } from 'react';
import axios from 'axios';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user'); // assuming a default role
    const [message, setMessage] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // Client-side username validation
    const validateUsername = (username) => {
        if (username.length < 3 || username.length > 20) {
            return 'Username must be between 3 and 20 characters.';
        }
        if (!/^[a-zA-Z0-9._]+$/.test(username)) {
            return 'Username can only contain letters, numbers, underscores, and periods.';
        }
        if (/(.)\1{2,}/.test(username) || /123|abc/.test(username)) {
            return 'Username should not have sequential or repeated characters.';
        }
        if (["admin", "user", "guest"].includes(username.toLowerCase())) {
            return 'This username is too common; please choose another.';
        }
        if (/^\d+$/.test(username)) {
            return 'Username cannot be all numbers.';
        }
        return '';
    };

    // Client-side password validation
    const validatePassword = (password) => {
        if (password.length < 8) {
            return 'Password must be at least 8 characters long.';
        }
        if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            return 'Password must include uppercase, lowercase, number, and special character.';
        }
        if (/^(.)\1*$/.test(password) || /1234|abcd|qwerty|password/.test(password)) {
            return 'Password should not contain easy-to-guess sequences.';
        }
        return '';
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        // Client-side validation
        const usernameValidationError = validateUsername(username);
        const passwordValidationError = validatePassword(password);

        if (usernameValidationError) {
            setUsernameError(usernameValidationError);
            return;
        } else {
            setUsernameError('');
        }

        if (passwordValidationError) {
            setPasswordError(passwordValidationError);
            return;
        } else {
            setPasswordError('');
        }

        // Server-side registration request
        try {
            const response = await axios.post('http://localhost:5000/register', { username, password, role });
            setMessage(response.data.message);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div>
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                {usernameError && <p style={{ color: 'red' }}>{usernameError}</p>}

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                {passwordError && <p style={{ color: 'red' }}>{passwordError}</p>}

                <button type="submit">Register</button>
            </form>
            <p>{message}</p>
        </div>
    );
}

export default Register;

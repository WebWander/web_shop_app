import React from 'react';
import { useNavigate } from 'react-router-dom';



function Home() {
    const navigate = useNavigate();
    return (
        <div>
            <h1>Welcome to Booklist</h1>
            <p>Check our available books.</p>
            <button onClick={() => navigate('/register')} className="reg-button">Get Started</button >
        </div>
    );
}

export default Home;

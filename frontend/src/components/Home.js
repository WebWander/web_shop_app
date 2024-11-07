import React from 'react';
import { useNavigate } from 'react-router-dom';



function Home() {
    const navigate = useNavigate();
    return (
        <div>
            <h1>Welcome to NetCourse</h1>
            <p>Unlock Your Potential with Online Learning with diverse selection of expertly designed courses tailored to your needs.</p>
            <button onClick={() => navigate('/register')} className="reg-button">Get Started</button >
        </div>
    );
}

export default Home;

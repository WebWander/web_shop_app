import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';

function UserPage() {
    const { authToken } = useContext(AuthContext);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/userpage', {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                });
                setUserData(response.data);
            } catch (error) {
                console.error('Failed to fetch user data:', error);
            }
        };

        if (authToken) {
            fetchUserData();
        }
    }, [authToken]);

    if (!userData) {
        return <p>Not authorized! You must log in.</p>;
    }

    return (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <h2>Welcome {userData.username}!</h2>
        </div>
    );
}

export default UserPage;

import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Reservation from './components/Reservation';
import Review from './components/Review';
import Home from './components/Home';
import LandPage from './components/LandingPage';
import './App.css';

export const AuthContext = React.createContext();

function App() {
  const [authToken, setAuthToken] = useState(null);

  return(
    <AuthContext.Provider value={{ authToken, setAuthToken}}>
      <Router>
        <nav>
          <Link to="/home">Home</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/reservation">Reservation</Link>
          <Link to="/review">Review</Link>
        </nav>
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reservation" element={<Reservation />} />
          <Route path="/review" element={<Review />} />
          <Route path="/" element={<LandPage />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  )
}

export default App;

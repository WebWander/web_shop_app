import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Reservation from './components/Reservation';
import Review from './components/Review';
import Home from './components/Home';
import UserPage from './components/UserPage';
// eslint-disable-next-line
import { ShoppingBag, User, Search, Package } from 'lucide-react';

import './App.css';

export const AuthContext = React.createContext();

function App() {
  const [authToken, setAuthToken] = useState(null);
  const [username, setUsername] = useState(null);

  return(
    <AuthContext.Provider value={{ authToken, setAuthToken, username, setUsername}}>
      <Router>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '1rem' }}>
        {/*<div className="search-container">
            <Search className="search-icon" />
            <input type="text" placeholder="Search" />
          </div>
          <Link to="/products" aria-label="Products">
            <Package className="icon" />
          </Link>
          {/*<Link to="/">Home</Link>*/}
          <div style={{ fontWeight: 'bold', fontSize: '1.5rem', color: 'white'}}>NetCourse</div>
          {username ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
              <User className="icon" />
              <span>{username}</span>
            </div>
          ) : (
            <Link to="/login" aria-label="Login" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
              <User className="icon" />
              <span>Login</span>
            </Link>
          )}
          {authToken && (
            <Link to="/cart" aria-label="Cart" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingBag className="icon" />
            </Link>
          )}

          {/*<Link to="/cart" aria-label="Cart">
            <ShoppingBag className="cart-icon" />
          </Link>
         
          {/*<Link to="/reservation">Reservation</Link>*/}
         {/* <Link to="/review">Review</Link>*/}
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reservation" element={<Reservation />} />
          <Route path="/review" element={<Review />} />
          <Route path="/userpage" element={<UserPage />} />
          
        
        </Routes>
      </Router>
    </AuthContext.Provider>
  )
}

export default App;

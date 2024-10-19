import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;
console.log("SECRET_KEY in middleware.js:", SECRET_KEY);



export const authencateToken = (req, res, next) => {
  console.log("SECRET_KEY in authencateToken:", SECRET_KEY);
  
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    console.error("No authorization header found");
    return res.status(401).json({ message: 'Access denied, no token provided' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    console.error("No token found in the Bearer header");
    return res.status(401).json({ message: 'Access denied, invalid token format' });
  }


  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      console.error("JWT verification failed:", err);
      return res.status(403).json({ message: 'Invalid token', error: err.message });
    }

    req.user = user; 
    next();
  });
};


  export const authorizeRole = (role) => {
    return (req, res, next) => {
      if (req.user.role !== role) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      next();
    };
  };

  export const generateToken = (user) => {
    console.log("SECRET_KEY in generateToken:", SECRET_KEY);
    return jwt.sign({ name: user.name, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
  }
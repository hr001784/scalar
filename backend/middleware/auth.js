const jwt = require('jsonwebtoken');
const SimpleUser = require('../models/SimpleUser');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      console.log('Auth middleware - Token received:', token ? 'Yes' : 'No');

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      console.log('Auth middleware - Token decoded, user ID:', decoded.id);

      // Get user from token
      const userModel = new SimpleUser();
      const user = await userModel.findById(decoded.id);
      console.log('Auth middleware - User found:', user ? 'Yes' : 'No');
      
      if (user) {
        console.log(`Auth middleware - User role: ${user.role}`);
        const { password, ...userWithoutPassword } = user;
        req.user = userWithoutPassword;
      } else {
        console.log('Auth middleware - User not found in database');
        req.user = null;
      }

      if (!req.user) {
        console.log('Auth middleware - User not set in request');
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      console.log(`Auth middleware - Authentication successful for user: ${req.user.name}`);
      next();
    } catch (error) {
      console.error('Auth middleware - Token verification error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    console.log('Auth middleware - No authorization header or not Bearer format');
  }

  if (!token) {
    console.log('Auth middleware - No token provided');
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role ${req.user.role} is not authorized to access this route` 
      });
    }

    next();
  };
};

module.exports = { protect, authorize };

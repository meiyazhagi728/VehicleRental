const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - require authentication
const protect = async (req, res, next) => {
  console.log('Auth middleware - Headers:', req.headers.authorization);
  console.log('Auth middleware - JWT_SECRET exists:', !!process.env.JWT_SECRET);
  
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      console.log('Auth middleware - Token extracted:', token.substring(0, 20) + '...');

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Auth middleware - Token decoded:', decoded);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');
      console.log('Auth middleware - User found:', req.user ? req.user.name : 'null');

      if (!req.user) {
        console.log('Auth middleware - User not found in database');
        return res.status(401).json({ message: 'User not found' });
      }

      if (!req.user.isActive) {
        console.log('Auth middleware - User account is deactivated');
        return res.status(401).json({ message: 'Account is deactivated' });
      }

      console.log('Auth middleware - Authentication successful');
      next();
    } catch (error) {
      console.error('Auth middleware - Token verification error:', error);
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token format' });
      } else if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      } else {
        return res.status(401).json({ message: 'Not authorized, token failed' });
      }
    }
  }

  if (!token) {
    console.log('Auth middleware - No token provided');
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Role-based authorization (accepts either a list of roles or a single array of roles)
const authorize = (...roles) => {
  return (req, res, next) => {
    const allowedRoles = Array.isArray(roles[0]) ? roles[0] : roles;
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role ${req.user.role} is not authorized to access this route` 
      });
    }

    // For vendors, check if they are approved
    if (req.user.role === 'vendor' && !req.user.isApproved) {
      return res.status(403).json({ 
        message: 'Your vendor account is pending approval' 
      });
    }

    next();
  };
};

// Check if user is approved (for vendors)
const checkApproval = async (req, res, next) => {
  if (req.user.role === 'vendor' && !req.user.isApproved) {
    return res.status(403).json({ 
      message: 'Your vendor account is pending approval. Please contact admin.' 
    });
  }
  next();
};

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = {
  protect,
  authorize,
  checkApproval,
  generateToken
};

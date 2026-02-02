const jwt = require('jsonwebtoken');

// Admin authentication middleware
const authenticateAdmin = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // For now, we'll use a simple token validation
    // In production, you should use proper JWT tokens
    const validTokens = ['adminToken'];
    
    if (!validTokens.includes(token)) {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    // Add admin info to request
    req.admin = { role: 'admin' };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// Check if user is admin (for frontend validation)
const isAdmin = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (token === 'adminToken') {
    req.isAdmin = true;
  } else {
    req.isAdmin = false;
  }
  
  next();
};

module.exports = {
  authenticateAdmin,
  isAdmin
};


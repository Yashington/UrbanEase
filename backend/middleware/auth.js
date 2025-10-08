const JWTService = require('../utils/jwt');
const User = require('../models/User');

// Middleware: Authenticate user via JWT
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const token = authHeader.substring(7);
    let decoded;
    try {
      decoded = JWTService.verifyToken(token);
    } catch (err) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token.' 
      });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token or user not found.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Authentication error.',
      error: error.message 
    });
  }
};

// Middleware: Authorize by user role(s)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required.' 
      });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions.' 
      });
    }
    next();
  };
};

// Optional: Middleware for optional authentication (public endpoints)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      let decoded;
      try {
        decoded = JWTService.verifyToken(token);
      } catch (err) {
        // Ignore token errors for optional auth
        return next();
      }
      const user = await User.findById(decoded.id);
      if (user && user.isActive) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = { authenticate, authorize, optionalAuth };
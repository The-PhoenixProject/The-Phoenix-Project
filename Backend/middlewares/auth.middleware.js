// middlewares/auth.middleware.js
const { verifyAccessToken } = require('../utlis/tokenHelper');
const User = require('../models/user.model');
const logger = require('../utlis/logger');

const verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided' 
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = verifyAccessToken(token);
    
    if (!decoded) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token' 
      });
    }

    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Check if user is suspended
    if (user.isSuspended) {
      return res.status(403).json({ 
        success: false,
        message: 'Account suspended',
        reason: user.suspensionReason
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ 
        success: false,
        message: 'Account deactivated' 
      });
    }

    // Attach user to request
    req.user = {
      userId: user._id,
      email: user.email,
      authProvider: user.authProvider
    };
    
    req.dbUser = user;

    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    
    if (error.message === 'Token expired') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.message === 'Invalid token') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token' 
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Authentication error' 
    });
  }
};

module.exports = verifyToken;
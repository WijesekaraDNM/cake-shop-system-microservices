const jwt = require('jsonwebtoken');
const { error } = require('../utils/responseHelper');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return error(res, 'Access denied. No token provided.', 401);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (jwtError) {
      return error(res, 'Invalid token.', 401);
    }
  } catch (err) {
    return error(res, 'Server error during authentication.', 500);
  }
};

// Optional auth middleware - doesn't fail if no token provided
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
      } catch (jwtError) {
        // Token invalid, but continue without user
        req.user = null;
      }
    }
    
    next();
  } catch (err) {
    return error(res, 'Server error during authentication.', 500);
  }
};

// Admin authorization middleware
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return error(res, 'Access denied. Authentication required.', 401);
  }

  if (!req.user.isAdmin && req.user.role !== 'admin') {
    return error(res, 'Access denied. Admin privileges required.', 403);
  }

  next();
};

// User authorization middleware - ensures user can only access their own resources
const requireOwnership = (req, res, next) => {
  const userId = req.params.userId || req.body.userId;
  
  if (!req.user) {
    return error(res, 'Access denied. Authentication required.', 401);
  }

  // Allow if user is admin or accessing their own resources
  if (req.user.isAdmin || req.user.role === 'admin' || req.user.id === userId) {
    next();
  } else {
    return error(res, 'Access denied. You can only access your own resources.', 403);
  }
};

module.exports = {
  auth,
  optionalAuth,
  requireAdmin,
  requireOwnership
};
const jwt = require('jsonwebtoken');

const auth = {
  // Required authentication - blocks request if no valid token
  required: (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_CART);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(400).json({ error: 'Invalid token.' });
    }
  },

  // Optional authentication - continues even without token
  optional: (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_CART);
        req.user = decoded;
      } catch (error) {
        // Invalid token, but continue without user
        req.user = null;
      }
    }

    next();
  }
};

module.exports = auth;
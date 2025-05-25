// Middleware to verify authentication
const jwt = require('jsonwebtoken');

// Extract JWT token from authorization header
const extractToken = req => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7); // Remove 'Bearer ' from string
  }
  return null;
};

// Middleware to verify if user is authenticated
const authenticate = (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized access. Token not provided.',
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user to request to use in protected routes
    req.user = decoded;

    // Continue with next middleware or route
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Session expired. Please log in again.',
      });
    }

    return res.status(401).json({
      status: 'error',
      message: 'Invalid token.',
      details: error.message,
    });
  }
};

module.exports = {
  authenticate,
  extractToken,
};

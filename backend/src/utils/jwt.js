const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (userId, shopId) => {
  return jwt.sign({ userId, shopId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

module.exports = {
  generateToken,
  verifyToken,
};

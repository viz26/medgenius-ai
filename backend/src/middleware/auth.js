const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new Error();
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' });
  }
};

module.exports = auth; 
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'svsbakery_secret');
    const user = await User.findById(decoded.id).select('-password').lean();
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    req.user = { ...user, id: user._id };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

const optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next();
  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'svsbakery_secret');
    const user = await User.findById(decoded.id).select('-password').lean();
    if (user) req.user = { ...user, id: user._id };
  } catch (_) {}
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied: Admin authorization required' });
  }
  next();
};

module.exports = { authenticate, optionalAuth, requireAdmin };

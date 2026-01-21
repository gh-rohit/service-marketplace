// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.userId });

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
};

const isProvider = (req, res, next) => {
  if (req.user.role !== 'provider') {
    return res.status(403).json({ error: 'Access denied. Providers only.' });
  }
  next();
};

const isCustomer = (req, res, next) => {
  if (req.user.role !== 'customer') {
    return res.status(403).json({ error: 'Access denied. Customers only.' });
  }
  next();
};

module.exports = { auth, isAdmin, isProvider, isCustomer };
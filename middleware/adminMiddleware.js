// server/middleware/adminMiddleware.js
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const adminProtect = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: 'Admin not authenticated' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin) return res.status(403).json({ message: 'Invalid admin token' });

    req.admin = admin;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Access denied: Admin only' });
  }
};

module.exports = { adminProtect };

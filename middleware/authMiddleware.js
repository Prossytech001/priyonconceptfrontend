// const jwt = require("jsonwebtoken");
// const User = require("../models/User");

// const protect = async (req, res, next) => {
//   let token = req.headers.authorization?.split(" ")[1];
//   if (!token) return res.status(401).json({ message: "Not authorized" });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = await User.findById(decoded.id).select("-password");
//     next();
//   } catch (err) {
//     res.status(401).json({ message: "Token failed" });
//   }
// };

// const isAdmin = (req, res, next) => {
//   if (req.user && req.user.isAdmin) next();
//   else res.status(403).json({ message: "Admin only" });
// };

// module.exports = { protect, isAdmin };
// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: 'Not authenticated' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = user; // attached to request
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token failed or expired' });
  }
};

module.exports = { protect };

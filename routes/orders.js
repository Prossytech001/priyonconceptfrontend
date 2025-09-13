// Server/routes/orders.js
// const express = require("express");
// const router = express.Router();

// router.get("/", (req, res) => {
//   res.send("Orders route working!");
// });

// module.exports = router;
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const {protect} = require('../middleware/authMiddleware'); // Assumes JWT/cookie-based auth

// @route   GET /api/orders/me
// @desc    Get logged-in user's orders
// @access  Private
router.get('/me' , protect , async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});
router.get("/", (req, res) => {
  res.send("Orders route working!");
});

module.exports = router;

// /routes/user.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

router.get('/me', protect, async (req, res) => {
  res.json(req.user); // req.user was set in your protect middleware
});

module.exports = router;

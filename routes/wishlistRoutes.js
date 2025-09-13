const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');

// 📥 Add to wishlist
// router.post('/add/:productId', protect, async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);

//     if (!user.wishlist.includes(req.params.productId)) {
//       user.wishlist.push(req.params.productId);
//       await user.save();
//     }

//     res.status(200).json({ message: 'Product added to wishlist', wishlist: user.wishlist });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// });
router.post('/add/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const productId = req.params.productId.toString();
    const wishlistIds = user.wishlist.map(id => id.toString());

    if (!wishlistIds.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
      return res.status(200).json({
        message: 'Product added to wishlist',
        wishlist: user.wishlist,
      });
    }

    return res.status(200).json({
      message: 'Product already in wishlist',
      wishlist: user.wishlist,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// 📤 Remove from wishlist
router.delete('/remove/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== req.params.productId
    );
    await user.save();

    res.status(200).json({ message: 'Product removed from wishlist', wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// 📄 Get all wishlist items
// router.get('/', protect, async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id).populate('wishlist');
//     res.status(200).json({ wishlist: user.wishlist });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// });
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({ path: 'wishlist', model: 'Product' });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ wishlist: user.wishlist });
  } catch (err) {
    console.error('Error populating wishlist:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;

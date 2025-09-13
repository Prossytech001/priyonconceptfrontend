// const express = require('express');
// const router = express.Router();
// const Order = require('../models/Order');

// const { adminProtect } = require('../middleware/adminMiddleware');

// router.get('/orders/stats', adminProtect, async (req, res) => {
//   const now = new Date();
//   const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//   const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

//   try {
//     const [totalOrders, ordersToday, ordersThisMonth, totalRevenue, statusCounts] = await Promise.all([
//       Order.countDocuments(),
//       Order.countDocuments({ createdAt: { $gte: startOfToday } }),
//       Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
//       Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
//       Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])
//     ]);

//     const mappedStatus = {};
//     statusCounts.forEach(s => mappedStatus[s._id] = s.count);

//     res.json({
//       totalOrders,
//       ordersToday,
//       ordersThisMonth,
//       totalRevenue: totalRevenue[0]?.total || 0,
//       statusCounts: {
//         Unconfirmed: mappedStatus.Unconfirmed || 0,
//         Processing: mappedStatus.Processing || 0,
//         Delivered: mappedStatus.Delivered || 0,
//         Cancelled: mappedStatus.Cancelled || 0
//       }
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch dashboard stats" });
//   }
// });

// router.get('/orders/recent', adminProtect, async (req, res) => {
//   try {
//     const recentOrders = await Order.find()
//       .populate('user', 'name')
//       .sort({ createdAt: -1 })
//       .limit(5);

//     res.json(recentOrders);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch recent orders" });
//   }
// });

// module.exports = router;

// Required modules
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { adminProtect } = require('../middleware/adminMiddleware');

// ✅ Always define specific routes first to avoid route conflicts

// Dashboard stats route
router.get('/orders/stats', adminProtect, async (req, res) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  try {
    const [totalOrders, ordersToday, ordersThisMonth, totalRevenue, statusCounts] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfToday } }),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
      Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])
    ]);

    const mappedStatus = {};
    statusCounts.forEach(s => mappedStatus[s._id] = s.count);

    res.json({
      totalOrders,
      ordersToday,
      ordersThisMonth,
      totalRevenue: totalRevenue[0]?.total || 0,
      statusCounts: {
        Unconfirmed: mappedStatus.Unconfirmed || 0,
        Processing: mappedStatus.Processing || 0,
        Delivered: mappedStatus.Delivered || 0,
        Cancelled: mappedStatus.Cancelled || 0
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
});

// Recent orders for dashboard
router.get('/orders/recent', adminProtect, async (req, res) => {
  try {
    const recentOrders = await Order.find()
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json(recentOrders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch recent orders" });
  }
});

// ❗ Ensure dynamic routes like this come last
router.get('/orders/:id', adminProtect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch order' });
  }
});

module.exports = router;

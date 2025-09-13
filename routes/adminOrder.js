// const express = require('express');
// const mongoose = require('mongoose');
// const router = express.Router();
// const Order = require('../models/Order');
// const User = require('../models/User');
// const { adminProtect } = require('../middleware/adminMiddleware');

// // GET /api/admin/orders - Get all orders with filters/search
// router.get('/', adminProtect,async (req, res) => {
//   try {
//     const { status, paymentStatus, startDate, endDate, month, search } = req.query;
//     const filters = {};

//     if (status) filters.status = status;
//     if (paymentStatus) filters.paymentStatus = paymentStatus;

//     if (startDate && endDate) {
//       filters.createdAt = {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate)
//       };
//     } else if (month) {
//       const [year, mon] = month.split('-');
//       const start = new Date(year, mon - 1, 1);
//       const end = new Date(year, mon, 0, 23, 59, 59);
//       filters.createdAt = { $gte: start, $lte: end };
//     }

//     if (search) {
//       if (mongoose.Types.ObjectId.isValid(search)) {
//         filters._id = search;
//       } else {
//         const users = await User.find({ email: new RegExp(search, 'i') }).select('_id');
//         filters.user = { $in: users.map((u) => u._id) };
//       }
//     }

//     const orders = await Order.find(filters)
//       .populate('user', 'name email')
//       .populate('items.product', 'title image price')
//       .sort({ createdAt: -1 });

//     res.json(orders);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Failed to fetch orders' });
//   }
// });

// // PATCH /api/admin/orders/:id/status - Update order status
// router.patch('/:id/status', adminProtect, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     const order = await Order.findById(id);
//     if (!order) return res.status(404).json({ message: 'Order not found' });

//     if (order.status === 'Delivered') {
//       return res.status(400).json({ message: 'Order already delivered. Cannot update.' });
//     }

//     order.status = status;
//     order.activityLog.push({ action: `Status updated to ${status}`, admin: req.user._id });
//     await order.save();

//     res.json({ message: 'Order status updated successfully', order });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Failed to update order status' });
//   }
// });

// // PATCH /api/admin/orders/:id/payment - Update payment status
// router.patch('/:id/payment', adminProtect,  async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { paymentStatus } = req.body;

//     if (!['Pending', 'Paid'].includes(paymentStatus)) {
//       return res.status(400).json({ message: 'Invalid payment status' });
//     }

//     const order = await Order.findById(id);
//     if (!order) return res.status(404).json({ message: 'Order not found' });

//     order.paymentStatus = paymentStatus;
//     order.activityLog.push({
//       action: `Payment status changed to ${paymentStatus}`,
//       admin: req.user._id
//     });

//     await order.save();
//     res.json({ message: 'Payment status updated successfully', order });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Failed to update payment status' });
//   }
// });

// module.exports = router;
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const { adminProtect} = require('../middleware/adminMiddleware');




router.get('/stats', adminProtect, async (req, res) => {
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

router.get('/recent', adminProtect, async (req, res) => {
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

// GET /api/admin/orders/most-ordered
router.get('/most-ordered', adminProtect, async (req, res) => {
  try {
    const result = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalOrdered: { $sum: "$items.quantity" }
        }
      },
      {
        $sort: { totalOrdered: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      {
        $unwind: "$product"
      },
      {
        $project: {
          _id: 0,
          productId: "$product._id",
          title: "$product.title",
          image: "$product.image",
          totalOrdered: 1
        }
      }
    ]);

    res.json(result);
  } catch (err) {
    console.error("Error fetching most ordered products:", err);
    res.status(500).json({ message: "Failed to fetch most ordered products" });
  }
});







// GET /api/admin/orders - Get all orders with filters/search
router.get('/', adminProtect, async (req, res) => {
  try {
    const { status, paymentStatus, startDate, endDate, month, search } = req.query;
    const filters = {};

    if (status) filters.status = status;
    if (paymentStatus) filters.paymentStatus = paymentStatus;

    if (startDate && endDate) {
      filters.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (month) {
      const [year, mon] = month.split('-');
      const start = new Date(year, mon - 1, 1);
      const end = new Date(year, mon, 0, 23, 59, 59);
      filters.createdAt = { $gte: start, $lte: end };
    }

    if (search) {
      if (mongoose.Types.ObjectId.isValid(search)) {
        filters._id = search;
      } else {
        const users = await User.find({ email: new RegExp(search, 'i') }).select('_id');
        filters.user = { $in: users.map((u) => u._id) };
      }
    }

    const orders = await Order.find(filters)
      .populate('user', 'name email')
      .populate('items.product', 'title image price')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// GET /api/admin/orders/:id - Get single order detail (for modal view)
router.get('/:id', adminProtect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'title image price');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch order details' });
  }
});

// PATCH /api/admin/orders/:id/status - Update order status
router.patch('/:id/status', adminProtect, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (["Delivered", "Cancelled"].includes(order.status)) {
      return res.status(400).json({ message: `Cannot update status for ${order.status} orders.` });
    }

    order.status = status;
    order.activityLog.push({ action: `Status updated to ${status}`, admin: req.userid });
    await order.save();

    res.json({ message: 'Order status updated successfully', order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update order status' });
  }
});

// PATCH /api/admin/orders/:id/payment - Update payment status
router.patch('/:id/payment', adminProtect, async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (["Delivered", "Cancelled"].includes(order.status)) {
      return res.status(400).json({ message: `Cannot update payment for ${order.status} orders.` });
    }

    if (!['Pending', 'Paid'].includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid payment status' });
    }

    order.paymentStatus = paymentStatus;
    // order.activityLog.push({
    //   action: `Payment status changed to ${paymentStatus}`,
    //   admin: req.user._id
    // });
    order.activityLog.push({
  action: `Status changed to ${status}`,
  admin: req.userid || null,
});


    await order.save();
    res.json({ message: 'Payment status updated successfully', order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update payment status' });
  }
});
// ✅ Move these first to avoid "stats" being treated as an ID


// ✅ Now safe to define dynamic route below
// router.get('/:id', adminProtect, async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.id)
//       .populate('user', 'name email phone')
//       .populate('items.product', 'title image price');

//     if (!order) return res.status(404).json({ message: 'Order not found' });

//     res.json(order);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Failed to fetch order details' });
//   }
// });

module.exports = router;

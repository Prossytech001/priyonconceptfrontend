// server/models/Order.js (simplified example)
// const mongoose = require("mongoose");

// const OrderSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//   items: [
//     {
//       name: String,
//       quantity: Number,
//       price: Number,
//     },
//   ],
//   totalAmount: Number,
//   paymentStatus: { type: String, default: "Pending" },
//   deliveryState: String,
//   deliveryFee: Number,
//   reference: String,
//   createdAt: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model("Order", OrderSchema);
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },

  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: String,
      image: String,
      price: Number,
      quantity: Number,
    }
  ],

  shippingAddress: {
    name: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    postalCode: String,
  },

  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid'],
    default: 'Pending'
  },

  status: {
    type: String,
    enum: ["Unconfirmed", "Processing", "Delivered", "Cancelled"],
    default: "Unconfirmed",
  },

  deliveryFee: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },

  reference: String,

  activityLog: [
    {
      action: String,
      admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      timestamp: { type: Date, default: Date.now }
    }
  ],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

OrderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Order', OrderSchema);

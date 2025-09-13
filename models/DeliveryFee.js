const mongoose = require('mongoose');

const deliveryFeeSchema = new mongoose.Schema({
  country: { type: String, required: true },
  state: { type: String, required: true },
  fee: { type: Number, required: true },
});

module.exports = mongoose.model('DeliveryFee', deliveryFeeSchema);

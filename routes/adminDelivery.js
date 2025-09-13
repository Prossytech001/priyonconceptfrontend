const express = require('express');
const router = express.Router();
const DeliveryFee = require('../models/DeliveryFee');
const { adminProtect } = require('../middleware/adminMiddleware');

// Get all delivery fees
router.get('/', async (req, res) => {
  const fees = await DeliveryFee.find();
  res.json(fees);
});

// Add or update a delivery fee
router.post('/', adminProtect, async (req, res) => {
  const { country, state, fee } = req.body;
  const existing = await DeliveryFee.findOne({ country, state });

  if (existing) {
    existing.fee = fee;
    await existing.save();
    return res.json({ message: 'Fee updated', data: existing });
  }

  const newFee = new DeliveryFee({ country, state, fee });
  await newFee.save();
  res.json({ message: 'Fee created', data: newFee });
});

// DELETE delivery fee by ID
router.delete('/:id', adminProtect, async (req, res) => {
  await DeliveryFee.findByIdAndDelete(req.params.id);
  res.json({ message: 'Fee deleted' });
});

module.exports = router;

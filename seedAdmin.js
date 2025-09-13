// server/seedAdmin.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('./models/Admin');

dotenv.config(); // Load .env
const connectDB = require('./config/db');

const seedAdmin = async () => {
  try {
    await connectDB();

    const exists = await Admin.findOne({ email: 'admin@luxury.com' });
    if (exists) {
      console.log('✅ Admin already exists');
      return process.exit();
    }

    const newAdmin = new Admin({
      username: 'superadmin',
      email: 'admin@luxury.com',
      password: '12345678', // will be hashed by pre-save hook
    });

    await newAdmin.save();
    console.log('✅ Admin seeded successfully');
    process.exit();
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedAdmin();

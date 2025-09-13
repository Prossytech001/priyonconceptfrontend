const mongoose = require('mongoose');

const siteSettingSchema = new mongoose.Schema({
  bannerImages: {
    type: [String],
    default: [],
    validate: [arr => arr.length <= 4, 'Max 4 banner images allowed']
  }
}, { timestamps: true });

module.exports = mongoose.model('SiteSetting', siteSettingSchema);

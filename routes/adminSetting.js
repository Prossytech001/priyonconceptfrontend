const express = require('express');
const router = express.Router();
const SiteSetting = require('../models/SiteSetting');
const { adminProtect } = require('../middleware/adminMiddleware');
const { upload } = require('../middleware/cloudinary');
const cloudinary = require('../config/cloudinary');


// DELETE /api/admin/settings/banner
router.delete('/banner', adminProtect, async (req, res) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ message: 'Image URL required' });
  }

  try {
    // Extract public_id from the Cloudinary URL
    const parts = imageUrl.split('/');
    const filename = parts[parts.length - 1].split('.')[0]; // without extension
    const publicId = `ecommerce-products/${filename}`;

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // Remove from DB
    const setting = await SiteSetting.findOne();
    if (!setting) return res.status(404).json({ message: 'Settings not found' });

    setting.bannerImages = setting.bannerImages.filter(img => img !== imageUrl);
    await setting.save();

    res.json({ message: 'Banner removed successfully', bannerImages: setting.bannerImages });
  } catch (err) {
    console.error('Delete banner error:', err);
    res.status(500).json({ message: 'Failed to delete image' });
  }
});
// Get current banners
router.get('/banner',  async (req, res) => {
  try {
    const setting = await SiteSetting.findOne();
    res.json({ bannerImages: setting?.bannerImages || [] });
  } catch (error) {
    console.error('GET /banner error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload multiple banners (up to 4)
router.post('/banner-upload', adminProtect, upload.array('bannerImages', 4), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    const imageUrls = files.map(file => file.path);
    let setting = await SiteSetting.findOne();

    if (!setting) {
      setting = new SiteSetting({ bannerImages: imageUrls });
    } else {
      // Combine existing + new (max 4)
      const combined = [...setting.bannerImages, ...imageUrls].slice(0, 4);
      setting.bannerImages = combined;
    }

    await setting.save();
    res.json({ message: 'Banners uploaded successfully', bannerImages: setting.bannerImages });

  } catch (error) {
    console.error('POST /banner-upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});


module.exports = router;

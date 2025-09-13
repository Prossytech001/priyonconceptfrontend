// routes/adminUpload.js
// const express = require('express');
// const router = express.Router();
// const Product = require('../models/Product');
// const { upload } = require('../middleware/cloudinary');
// const { adminProtect } = require('../middleware/adminMiddleware');

// // POST /api/admin/products
// router.post('/products', adminProtect, upload.array('images', 4), async (req, res) => {
//   try {
//     const {
//       name,
//       slug,
//       description,
//       category,
//       basePrice,
//       sizeVariants,
//       isNew,
//       featured,
//       inStock
//     } = req.body;

//     // Parse sizeVariants if it's sent as JSON string
//     const parsedSizeVariants = typeof sizeVariants === 'string'
//       ? JSON.parse(sizeVariants)
//       : sizeVariants;

//     // Extract Cloudinary image URLs
//     const imageUrls = req.files.map(file => file.path);

//     const newProduct = new Product({
//       name,
//       slug,
//       description,
//       category,
//       basePrice,
//       sizeVariants: parsedSizeVariants,
//       images: imageUrls,
//       isNew: isNew === 'true',
//       featured: featured === 'true',
//       inStock: inStock !== 'false', // default is true
//     });

//     await newProduct.save();

//     res.status(201).json({ message: 'Product uploaded successfully', product: newProduct });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Failed to upload product', error: err.message });
//   }
// });

// module.exports = router;
// router.post('/products', adminProtect, upload.array('images', 4), async (req, res) => {
//   try {
//     const {
//       name,
//       slug,
//       description,
//       category,
//       basePrice,
//       sizeVariants,
//       isNew,
//       featured,
//       inStock
//     } = req.body;

//     // Basic validation
//     if (!name || !slug || !description || !category || !basePrice) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     // Parse JSON variants
//     let parsedSizeVariants = [];
//     try {
//       parsedSizeVariants = typeof sizeVariants === 'string'
//         ? JSON.parse(sizeVariants)
//         : sizeVariants;
//     } catch (err) {
//       return res.status(400).json({ message: "Invalid sizeVariants format", error: err.message });
//     }

//     // Validate Cloudinary upload
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ message: "No images uploaded" });
//     }

//     const imageUrls = req.files.map(file => file.path);

//     const newProduct = new Product({
//       name,
//       slug,
//       description,
//       category,
//       basePrice,
//       sizeVariants: parsedSizeVariants,
//       images: imageUrls,
//       isNew: isNew === 'true',
//       featured: featured === 'true',
//       inStock: inStock !== 'false',
//     });

//     await newProduct.save();

//     res.status(201).json({ message: 'Product uploaded successfully', product: newProduct });
//   } catch (err) {
//     console.error("❌ Upload failed:", err);
//     res.status(500).json({ message: 'Failed to upload product', error: err.message });
//   }
// });
// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const { adminProtect } = require('../middleware/adminMiddleware');
// const cloudinary = require('../middleware/cloudinary');
// const Product = require('../models/Product');

// // Multer config: store files in memory
// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// // Utility: Upload file buffer to Cloudinary
// const uploadToCloudinary = (fileBuffer) => {
//   return new Promise((resolve, reject) => {
//     cloudinary.uploader.upload_stream(
//       { folder: 'products' },
//       (err, result) => {
//         if (err) {
//           console.error("❌ Cloudinary upload error:", err);
//           return reject(err);
//         }
//         if (!result?.secure_url) {
//           console.error("❌ No secure_url in Cloudinary result:", result);
//           return reject(new Error("No secure_url returned from Cloudinary"));
//         }
//         resolve(result.secure_url);
//       }
//     ).end(fileBuffer);
//   });
// };


// // POST /api/admin/products
// router.post('/products', adminProtect, upload.array('images', 4), async (req, res) => {
//   try {
//     const {
//       name,
//       slug,
//       description,
//       category,
//       basePrice,
//       sizeVariants,
//       isNew,
//       featured,
//       inStock
//     } = req.body;

//     // Basic validation
//     if (!name || !slug || !description || !category || !basePrice) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     // Parse size variants (as stringified JSON)
//     let parsedSizeVariants = [];
//     try {
//       parsedSizeVariants = typeof sizeVariants === 'string'
//         ? JSON.parse(sizeVariants)
//         : sizeVariants;
//     } catch (err) {
//       return res.status(400).json({ message: "Invalid sizeVariants format", error: err.message });
//     }

//     // Handle images
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ message: "No images uploaded" });
//     }

//     const imageUrls = await Promise.all(
//       req.files.map(file => uploadToCloudinary(file.buffer))
//     );

//     const newProduct = new Product({
//       name,
//       slug,
//       description,
//       category,
//       basePrice,
//       sizeVariants: parsedSizeVariants,
//       images: imageUrls,
//       isNew: isNew === 'true',
//       featured: featured === 'true',
//       inStock: inStock !== 'false',
//     });

//     await newProduct.save();

//     res.status(201).json({ message: 'Product uploaded successfully', product: newProduct });
//   } catch (err) {
//     console.error("❌ Upload failed:", err);
//     res.status(500).json({ message: 'Failed to upload product', error: err.message });
//   }
// });

// module.exports = router;
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { adminProtect } = require('../middleware/adminMiddleware');
const cloudinary = require('../config/cloudinary'); // ✅ FIXED: now using correct cloudinary config
const Product = require('../models/Product');

// Multer config: store files in memory (used for upload_stream)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Utility: Upload file buffer to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: 'products' },
      (err, result) => {
        if (err) {
          console.error("❌ Cloudinary upload error:", err);
          return reject(err);
        }
        if (!result?.secure_url) {
          console.error("❌ No secure_url in Cloudinary result:", result);
          return reject(new Error("No secure_url returned from Cloudinary"));
        }
        resolve(result.secure_url);
      }
    ).end(fileBuffer);
  });
};

// POST /api/admin/products
router.post('/products', adminProtect, upload.array('images', 4), async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      category,
      basePrice,
      sizeVariants,
      isNew,
      featured,
      inStock
    } = req.body;

    // Basic validation
    if (!name || !slug || !description || !category || !basePrice) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Parse sizeVariants (stringified JSON from form input)
    let parsedSizeVariants = [];
    try {
      parsedSizeVariants = typeof sizeVariants === 'string'
        ? JSON.parse(sizeVariants)
        : sizeVariants;
    } catch (err) {
      return res.status(400).json({ message: "Invalid sizeVariants format", error: err.message });
    }

    // Check images
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    // Upload all images to Cloudinary
    const imageUrls = await Promise.all(
      req.files.map(file => uploadToCloudinary(file.buffer))
    );

    // Create product
    const newProduct = new Product({
      name,
      slug,
      description,
      category,
      basePrice,
      sizeVariants: parsedSizeVariants,
      images: imageUrls,
      isNew: isNew === 'true',
      featured: featured === 'true',
      inStock: inStock !== 'false',
    });

    await newProduct.save();

    res.status(201).json({ message: 'Product uploaded successfully', product: newProduct });
  } catch (err) {
    console.error("❌ Upload failed:", err);
    res.status(500).json({ message: 'Failed to upload product', error: err.message });
  }
});

module.exports = router;

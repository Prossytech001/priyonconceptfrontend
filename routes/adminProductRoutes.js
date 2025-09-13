// const express = require('express');
// const router = express.Router();
// const { adminProtect } = require('../middleware/adminMiddleware');
// const Product = require('../models/Product');

// // Get all products (with optional filter)
// router.get('/', adminProtect, async (req, res) => {
//   try {
//     const { category, featured, inStock } = req.query;
//     const filter = {};

//     if (category) filter.category = category;
//     if (featured) filter.featured = featured === 'true';
//     if (inStock) filter.inStock = inStock === 'true';

//     const products = await Product.find(filter).sort({ createdAt: -1 });
//     res.json(products);
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// });

// // Update product
// router.put('/:id', adminProtect, async (req, res) => {
//   try {
//     const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//     });
//     if (!updated) return res.status(404).json({ message: 'Product not found' });
//     res.json(updated);
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to update product' });
//   }
// });

// // Delete product
// router.delete('/:id', adminProtect, async (req, res) => {
//   try {
//     const deleted = await Product.findByIdAndDelete(req.params.id);
//     if (!deleted) return res.status(404).json({ message: 'Product not found' });
//     res.json({ message: 'Product deleted' });
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to delete product' });
//   }
// });
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { adminProtect } = require('../middleware/adminMiddleware');
const cloudinary = require('../middleware/cloudinary');
const Product = require('../models/Product');

// Multer config (in-memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// @route   POST /api/admin/products
// @desc    Admin uploads new product
// router.post('/products', adminProtect, upload.array('images', 4), async (req, res) => {
//   try {
//     const { name, slug, description, category, basePrice, sizeVariants, featured, isNew } = req.body;

//     // Upload images to Cloudinary
//     const uploadedImages = [];
//     for (const file of req.files) {
//       const result = await cloudinary.uploader.upload_stream({ folder: 'products' }, (err, result) => {
//         if (err) throw new Error('Image upload failed');
//         uploadedImages.push(result.secure_url);
//       }).end(file.buffer);
//     }

//     const parsedSizes = JSON.parse(sizeVariants);

//     const newProduct = new Product({
//       name,
//       slug,
//       description,
//       category,
//       basePrice,
//       sizeVariants: parsedSizes,
//       featured: featured === 'true',
//       isNew: isNew === 'true',
//       images: uploadedImages,
//     });

//     await newProduct.save();
//     res.status(201).json({ message: 'Product uploaded successfully', product: newProduct });
//   } catch (err) {
//     res.status(500).json({ message: 'Upload failed', error: err.message });
//   }
// });
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

    // Parse JSON variants
    let parsedSizeVariants = [];
    try {
      parsedSizeVariants = typeof sizeVariants === 'string'
        ? JSON.parse(sizeVariants)
        : sizeVariants;
    } catch (err) {
      return res.status(400).json({ message: "Invalid sizeVariants format", error: err.message });
    }

    // Validate Cloudinary upload
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const imageUrls = req.files.map(file => file.path);

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

// @route   GET /api/admin/products
// @desc    Get all products (with optional filters)
// router.get('/products', adminProtect, async (req, res) => {
//   try {
//     const { category, inStock } = req.query;
//     const filters = {};

//     if (category) filters.category = category;
//     if (inStock !== undefined) filters.inStock = inStock === 'true';

//     const products = await Product.find(filters).sort({ createdAt: -1 });
//     res.json(products);
//   } catch (err) {
//     res.status(500).json({ message: 'Fetch failed', error: err.message });
//   }
// });
// @route   GET /api/admin/products
// @desc    Get all products with optional filters and pagination
router.get('/products', adminProtect, async (req, res) => {
  try {
    const { category, inStock, page = 1, limit = 10 , search} = req.query;

    const filters = {};
    if (category) filters.category = category;
    if (inStock !== undefined) filters.inStock = inStock === 'true';
    
  if (search) {
      filters.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }


    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Product.countDocuments(filters);

    const products = await Product.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      products,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: 'Fetch failed', error: err.message });
  }
});


// @route   PUT /api/admin/products/:id
// @desc    Update product by ID
router.put('/products/:id', adminProtect, async (req, res) => {
  try {
    const updates = req.body;

    if (updates.sizeVariants) {
      updates.sizeVariants = JSON.parse(updates.sizeVariants);
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updated) return res.status(404).json({ message: 'Product not found' });

    res.json({ message: 'Product updated', product: updated });
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
});

// @route   DELETE /api/admin/products/:id
// @desc    Delete product
router.delete('/products/:id', adminProtect, async (req, res) => {
  try {
    const removed = await Product.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ message: 'Product not found' });

    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
});

// @route   GET /api/admin/products/:id
// @desc    Get a single product by ID
router.get('/products/:id', adminProtect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch product', error: err.message });
  }
});


module.exports = router;

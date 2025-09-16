// const express = require('express');
// const router = express.Router();
// const Product = require('../models/Product');
// const { adminProtect } = require('../middleware/adminMiddleware');

// // @route   POST /api/products
// // @desc    Admin upload new product
// // @access  Private (Admin only)
// router.post('/', adminProtect, async (req, res) => {
//   try {
//     const {
//       name,
//       slug,
//       description,
//       category,
//       basePrice,
//       images,
//       sizeVariants, // 🧠 Note this matches your model
//       featured,
//       inStock
//     } = req.body;

//     // Validation
//     if (!name || !slug || !basePrice || !Array.isArray(images) || !Array.isArray(sizeVariants)) {
//       return res.status(400).json({ message: 'Missing or invalid product fields' });
//     }

//     // Slug must be unique
//     const exists = await Product.findOne({ slug });
//     if (exists) return res.status(400).json({ message: 'Slug already exists' });

//     // Create new product
//     const product = new Product({
//       name,
//       slug,
//       description,
//       category,
//       basePrice,
//       images,
//       sizeVariants,  // 👈 Use directly since it matches schema
//       featured: !!featured,
//       inStock: inStock !== false
//     });

//     await product.save();

//     res.status(201).json({ message: '✅ Product created successfully', product });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: '❌ Server error', error: err.message });
//   }
// });


// router.get('/', async (req, res) => {
//   try {
//     const {
//       search,
//       minPrice,
//       maxPrice,
//       size,
//       category,
//       inStock,
//       featured,
//       sort,
//       page = 1,
//       limit = 12
//     } = req.query;

//     const query = {};

//     // Filtering logic
//     // if (search) {
//     //   query.name = { $regex: search, $options: 'i' };
//     //   query.category = { $regex: new RegExp(category, 'i') };
//     //   query.sizeVariants = { $elemMatch: { size: isNaN(size) ? size : parseFloat(size) } };
//     // }
//     if (search) {
//   query.$or = [
//     { name: { $regex: search, $options: "i" } },
//     { description: { $regex: search, $options: "i" } },
//     { slug: { $regex: search, $options: "i" } },
//     { category: { $regex: search, $options: "i" } },
//   ];
// }

//     if (minPrice || maxPrice) {
//       query['sizeVariants.price'] = {};
//       if (minPrice) query['sizeVariants.price'].$gte = parseFloat(minPrice);
//       if (maxPrice) query['sizeVariants.price'].$lte = parseFloat(maxPrice);
//     }

//     if (size) {
//       query.sizeVariants = { $elemMatch: { size: isNaN(size) ? size : parseFloat(size) } };
//     }

//     if (category) {
//       query.category = { $regex: new RegExp(category, 'i') };
//     }

//     if (inStock === 'true') {
//       query.inStock = true;
//     }

//     if (featured === 'true') {
//       query.featured = true;
//     }

//     const sortOption = sort === 'asc' ? 1 : sort === 'desc' ? -1 : -1;
//     const skip = (parseInt(page) - 1) * parseInt(limit);
//     const perPage = parseInt(limit);

//     const [products, total] = await Promise.all([
//       Product.find(query)
//         .sort({ basePrice: sortOption })
//         .skip(skip)
//         .limit(perPage),
//       Product.countDocuments(query)
//     ]);

//     res.status(200).json({ products, total });
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to fetch products', error: err.message });
//   }
// });




// // @route   GET /api/products/:slug
// // @desc    Get single product by slug
// // @access  Public
// router.get('/:slug', async (req, res) => {
//   try {
//     const product = await Product.findOne({ slug: req.params.slug });
//     if (!product) return res.status(404).json({ message: 'Product not found' });

//     res.status(200).json(product);
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// });



// router.get('/category/:category', async (req, res) => {
//   const categoryParam = req.params.category.toLowerCase();

//   try {
//     const products = await Product.find({
//       category: { $regex: new RegExp(`^${categoryParam}$`, 'i') },
//     });

//     res.json(products);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch category products' });
//   }
// });




// module.exports = router;
const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { adminProtect } = require("../middleware/adminMiddleware");

// @route   POST /api/products
// @desc    Admin upload new product
// @access  Private (Admin only)
router.post("/", adminProtect, async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      category,
      basePrice,
      images,
      sizeVariants,
      featured,
      inStock,
      negotiable,
      whatsAppOnly,
    } = req.body;

    if (!name || !slug || !basePrice || !Array.isArray(images)) {
      return res.status(400).json({ message: "Missing or invalid product fields" });
    }

    const exists = await Product.findOne({ slug });
    if (exists) return res.status(400).json({ message: "Slug already exists" });

    const product = new Product({
      name,
      slug,
      description,
      category,
      basePrice,
      images,
      sizeVariants,
      featured: !!featured,
      inStock: inStock !== false,
      negotiable: !!negotiable,
      whatsAppOnly: !!whatsAppOnly,
    });

    await product.save();
    res.status(201).json({ message: "✅ Product created successfully", product });
  } catch (err) {
    res.status(500).json({ message: "❌ Server error", error: err.message });
  }
});

// @route   GET /api/products
// @desc    Get all products with filters
// @access  Public
router.get("/", async (req, res) => {
  try {
    const {
      search,
      minPrice,
      maxPrice,
      size,
      category,
      inStock,
      featured,
      negotiable,
      whatsAppOnly,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    if (minPrice || maxPrice) {
      query["sizeVariants.price"] = {};
      if (minPrice) query["sizeVariants.price"].$gte = parseFloat(minPrice);
      if (maxPrice) query["sizeVariants.price"].$lte = parseFloat(maxPrice);
    }

    if (size) {
      query.sizeVariants = {
        $elemMatch: { size: isNaN(size) ? size : parseFloat(size) },
      };
    }

    if (category) {
      query.category = { $regex: new RegExp(category, "i") };
    }

    if (inStock === "true") query.inStock = true;
    if (featured === "true") query.featured = true;
    if (negotiable === "true") query.negotiable = true;
    if (whatsAppOnly === "true") query.whatsAppOnly = true;

    const sortOption = sort === "asc" ? 1 : sort === "desc" ? -1 : -1;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const perPage = parseInt(limit);

    const [products, total] = await Promise.all([
      Product.find(query).sort({ basePrice: sortOption }).skip(skip).limit(perPage),
      Product.countDocuments(query),
    ]);

    res.status(200).json({ products, total });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products", error: err.message });
  }
});

// @route   GET /api/products/:slug
// @desc    Get single product by slug
// @access  Public
router.get("/:slug", async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route   GET /api/products/category/:category
// @desc    Get products by category
// @access  Public
router.get("/category/:category", async (req, res) => {
  try {
    const products = await Product.find({
      category: { $regex: new RegExp(`^${req.params.category}$`, "i") },
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch category products" });
  }
});

module.exports = router;

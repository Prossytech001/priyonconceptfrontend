// const mongoose = require('mongoose');

// const sizeVariantSchema = new mongoose.Schema({
//   size: { type: Number, required: true },   // e.g. 36, 38, 40, 42
//   quantity: { type: Number, required: true, default: 0 },
//   sku: { type: String },                     // optional: size-specific SKU
//   price: { type: Number },                   // optional: if size prices differ
// });

// const productSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   slug: { type: String, unique: true, required: true },
//   description: { type: String },
//   category: { type: String },

//   images: [{ type: String }],               // up to 4 Cloudinary URLs

//   basePrice: { type: Number, required: true }, // displayed base price
//   sizeVariants: [sizeVariantSchema],  
//   isNew: {
//     type: Boolean,
//     default: false,
//   },      // up to 10

//   featured: { type: Boolean, default: false },
//   inStock: { type: Boolean, default: true },
//   createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('Product', productSchema);
// const mongoose = require("mongoose");

// const sizeVariantSchema = new mongoose.Schema({
//   size: { type: String }, // "S", "M", "L" or shoe size "39, 40"
//   quantity: { type: Number, default: 0 },
//   sku: { type: String },
//   price: { type: Number }, // override basePrice if needed
// });

// const productSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   slug: { type: String, unique: true, required: true },
//   description: String,
//   category: { 
//     type: String, 
//     enum: ["Clothes", "Shoes", "Watches", "Accessories"], 
//     required: true 
//   },
//   images: [{ type: String }], // Cloudinary URLs

//   basePrice: { type: Number, required: true },
//   sizeVariants: [sizeVariantSchema],

//   negotiable: { type: Boolean, default: false }, // clothes = true
//   whatsAppOnly: { type: Boolean, default: false }, // clothes = true

//   isNew: { type: Boolean, default: false },
//   featured: { type: Boolean, default: false },
//   inStock: { type: Boolean, default: true },

//   createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model("Product", productSchema);
const mongoose = require("mongoose");

const sizeVariantSchema = new mongoose.Schema({
  size: { type: String }, // e.g. "S", "M", "L", or "42"
  quantity: { type: Number, default: 0 },
  sku: { type: String },
  price: { type: Number }, // optional override of basePrice
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true, required: true },
  description: String,
  category: {
    type: String,
    enum: ["Clothes", "Shoes", "Watches", "Accessories"],
    required: true,
  },

  images: [{ type: String }], // Cloudinary URLs
  basePrice: { type: Number, required: true },
  sizeVariants: [sizeVariantSchema],

  negotiable: { type: Boolean, default: false }, // Clothes = true
  whatsAppOnly: { type: Boolean, default: false }, // Clothes = true

  isNew: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  inStock: { type: Boolean, default: true },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Product", productSchema);

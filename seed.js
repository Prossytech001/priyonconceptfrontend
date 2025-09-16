const mongoose = require("mongoose");
const Product = require("./models/Product");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await Product.deleteMany();

  await Product.insertMany([
    {
      name: "Agbada",
      slug: "agbada-01",
      category: "Clothes",
      basePrice: 60000,
      images: ["/images/agbada.jpg"],
      negotiable: true,
      whatsAppOnly: true,
    },
    {
      name: "Leather Slippers",
      slug: "slippers-01",
      category: "Shoes",
      basePrice: 15000,
      sizeVariants: [{ size: 42, quantity: 5 }],
      negotiable: false,
    },
    {
      name: "Gold Watch",
      slug: "watch-01",
      category: "Watches",
      basePrice: 85000,
      negotiable: false,
    },
  ]);

  console.log("✅ Seeded products into DB");
  mongoose.connection.close();
});

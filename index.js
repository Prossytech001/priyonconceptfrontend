const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const connectDB = require("./config/db");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const checkoutRoutes = require("./routes/checkout");

connectDB();

const app = express();
app.use(
  cors({
     //origin: "https://my-ecommerce-project-ten.vercel.app ", // your frontend dev origin
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use("/api/checkout", checkoutRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Template Backend API");
});

// Routes
// app.use("/api/products", require("./routes/products"));
// app.use("/api/orders", require("./routes/orders"));
// app.use("/api/checkout", require("./routes/checkout"));
// app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/adminAuth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/auth", require("./routes/authRoutes"));
const wishlistRoutes = require("./routes/wishlistRoutes");
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/user", require("./routes/user"));

const adminProductRoutes = require('./routes/adminProductRoutes');
app.use('/api/admin', adminProductRoutes);
app.use('/api/admin/upload', require('./routes/adminUpload'));
const adminOrdersRoutes = require('./routes/adminOrder');
app.use('/api/admin/orders', adminOrdersRoutes);
app.use('/api/admin/settings', require('./routes/adminSetting'));
app.use('/api/admin/delivery-fees', require('./routes/adminDelivery'));


// app.use('/api/admin', require('./routes/adminDashboard'));




const PORT = process.env.PORT || 5101;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

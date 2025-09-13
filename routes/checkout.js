// const express = require("express");
// const router = express.Router();
// const axios = require("axios");
// const deliveryFees = require("../config/deliveryFees");

// const Order = require("../models/Order");
// const crypto = require("crypto");

// const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// // @route   POST /api/checkout/paystack
// // @desc    Initialize Paystack transaction
// router.post("/paystack", async (req, res) => {
//   try {
//     const { email, cartItems, state, userId, phone, country } = req.body;

//     if (!email || !cartItems || !state) {
//       return res.status(400).json({ message: "Missing required fields." });
//     }

//     // Sum total cart amount
//     const cartTotal = cartItems.reduce((acc, item) => {
//       return acc + item.price * item.quantity;
//     }, 0);

//     // Add delivery fee
//     const deliveryFee = deliveryFees[country]?.[state];
//     if (!deliveryFee) {
//       return res.status(400).json({ message: "Invalid delivery location." });
//     }

//     const totalAmount = cartTotal + deliveryFee;

//     // Convert to kobo (Paystack requires lowest currency unit)
//     const paystackAmount = totalAmount * 100;

//     // Initialize transaction
//     const response = await axios.post(
//       "https://api.paystack.co/transaction/initialize",
//       {
//         email,
//         amount: paystackAmount,
//         metadata: {
//           userId,
//           cartItems,
//           deliveryState: state,
//           phone,
//           deliveryFee,
//         },
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     const { authorization_url, access_code, reference } = response.data.data;

//     return res.status(200).json({
//       message: "Paystack transaction initialized",
//       authorization_url,
//       access_code,
//       reference,
//     });
//   } catch (err) {
//     console.error(err.response?.data || err.message);
//     return res.status(500).json({ message: "Failed to initialize payment." });
//   }
// });

// console.log("🔐 Using PAYSTACK_SECRET_KEY:", PAYSTACK_SECRET_KEY);

// router.post(
//   "/webhook",
//   express.json({
//     verify: (req, res, buf) => {
//       req.rawBody = buf; // keep raw body for signature verification
//     },
//   }),
//   async (req, res) => {
//     try {
//       const secret = process.env.PAYSTACK_SECRET_KEY;
//       const hash = crypto
//         .createHmac("sha512", secret)
//         .update(req.rawBody)
//         .digest("hex");

//       if (hash !== req.headers["x-paystack-signature"]) {
//         return res.status(400).send("⚠️ Invalid signature");
//       }

//       const event = req.body;

//       if (event.event === "charge.success") {
//         const data = event.data;

//         // Get values from metadata (we sent this during /initialize)
//         const { userId, cartItems, deliveryState, deliveryFee } = data.metadata;

//         // Save the order
//         const newOrder = new Order({
//           user: userId,
//           items: cartItems,
//           totalAmount: data.amount / 100,
//           paymentStatus: "Paid",
//           deliveryState,
//           deliveryFee,
//           reference: data.reference,
//         });

//         await newOrder.save();

//         console.log(`✅ Order saved for ${data.customer.email}`);
//       }

//       return res.status(200).send("✅ Webhook received");
//     } catch (err) {
//       console.error("Webhook error:", err.message);
//       return res.status(500).send("Server error");
//     }
//   }
// );

// module.exports = router;
const express = require("express");
const router = express.Router();
const axios = require("axios");
const crypto = require("crypto");

const Order = require("../models/Order");
const deliveryFees = require("../config/deliveryFees");

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// POST /api/checkout/paystack
// router.post("/paystack", async (req, res) => {
//   try {
//     const {
//       email,
//       cartItems,
//       state,
//       city,
//       address,
//       postalCode,
//       phone,
//       country,
//       name,
//       userId,
//     } = req.body;

//     if (!email || !cartItems || !state || !address || !phone) {
//       return res.status(400).json({ message: "Missing required fields." });
//     }

//     const cartTotal = cartItems.reduce((acc, item) => {
//       return acc + item.price * item.quantity;
//     }, 0);

//     const deliveryFee = deliveryFees[country]?.[state];
//     if (!deliveryFee) {
//       return res.status(400).json({ message: "Invalid delivery location." });
//     }

//     const totalAmount = cartTotal + deliveryFee;
//     const paystackAmount = totalAmount * 100;

//     const response = await axios.post(
//       "https://api.paystack.co/transaction/initialize",
//       {
//         email,
//         amount: paystackAmount,
//         metadata: {
//           userId,
//           cartItems,
//           shippingAddress: {
//             name,
//             phone,
//             address,
//             city,
//             state,
//             postalCode,
//           },
//           deliveryFee,
//         },
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     const { authorization_url, access_code, reference } = response.data.data;

//     return res.status(200).json({
//       message: "Paystack transaction initialized",
//       authorization_url,
//       access_code,
//       reference,
//     });
//   } catch (err) {
//     console.error(err.response?.data || err.message);
//     return res.status(500).json({ message: "Failed to initialize payment." });
//   }
// });
router.post("/paystack", async (req, res) => {
  try {
    const {
      email,
      cartItems,
      state,
      city,
      address,
      postalCode,
      phone,
      country,
      name,
      userId,
    } = req.body;

    if (!email || !cartItems || !state || !address || !phone) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const cartTotal = cartItems.reduce((acc, item) => {
      return acc + item.price * item.quantity;
    }, 0);

    const deliveryFee = deliveryFees[country]?.[state];
    if (!deliveryFee) {
      return res.status(400).json({ message: "Invalid delivery location." });
    }

    const totalAmount = cartTotal + deliveryFee;
    const paystackAmount = totalAmount * 100;

    // Step 1: Create unique reference
    const reference = `ref_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

   

    // Step 3: Initialize Paystack
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: paystackAmount,
        reference,
        metadata: {
          userId,
          cartItems,
          deliveryState: state,
          deliveryFee,
          shippingAddress: {
            name,
            phone,
            address,
            city,
            state,
            postalCode,
            country,
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { authorization_url, access_code } = response.data.data;

    return res.status(200).json({
      message: "Paystack transaction initialized",
      authorization_url,
      access_code,
      reference,
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    return res.status(500).json({ message: "Failed to initialize payment." });
  }
});

router.post(
  "/webhook",
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  }),
  async (req, res) => {
    try {
      const secret = process.env.PAYSTACK_SECRET_KEY;
      const hash = crypto
        .createHmac("sha512", secret)
        .update(req.rawBody)
        .digest("hex");

      if (hash !== req.headers["x-paystack-signature"]) {
        return res.status(400).send("⚠️ Invalid signature");
      }

      const event = req.body;

      if (event.event === "charge.success") {
        const data = event.data;
        const {
          userId,
          cartItems,
          shippingAddress,
          deliveryFee,
        } = data.metadata;

        const items = cartItems.map(item => ({
          product: item._id,
          name: item.name,
          image: item.image || null,
          price: item.price,
          quantity: item.quantity,
        }));

        const newOrder = new Order({
    user: userId || null,
    items: cartItems,
    totalAmount: data.amount / 100,
    paymentStatus: "Paid",
    status: "Confirmed",
    deliveryState,
    deliveryFee,
    reference: data.reference,
    shippingAddress,
  });

        await newOrder.save();

        console.log(`✅ Order saved for ${data.customer.email}`);
      }

      return res.status(200).send("✅ Webhook received");
    } catch (err) {
      console.error("Webhook error:", err.message);
      return res.status(500).send("Server error");
    }
  }
);

module.exports = router;


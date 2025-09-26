const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

router.post("/", async (req, res) => {
  try {
    const { userId, products, total, paymentMethod, address, phone, date } = req.body;
    const order = new Order({ userId, products, total, paymentMethod, address, phone, date });
    await order.save();
    res.status(201).json({ message: "Order placed successfully" });
  } catch (err) {
    console.error("Order POST error:", err);
    res.status(500).json({ message: "Failed to place order" });
  }
});

module.exports = router;
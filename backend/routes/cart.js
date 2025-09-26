const express = require("express");
const Cart = require("../models/Cart");
const router = express.Router();

// Get user's cart
router.get("/:userId", async (req, res) => {
  const cart = await Cart.findOne({ userId: req.params.userId }).populate("products.productId");
  res.json(cart || { products: [] });
});

// Update cart
router.post("/:userId", async (req, res) => {
  const { products } = req.body;
  let cart = await Cart.findOne({ userId: req.params.userId });
  if (cart) {
    cart.products = products;
    await cart.save();
  } else {
    cart = await Cart.create({ userId: req.params.userId, products });
  }
  res.json(cart);
});

module.exports = router;
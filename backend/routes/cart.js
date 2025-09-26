const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');

// Get cart for user
router.get('/:userId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    res.json(cart || { userId: req.params.userId, items: [] });
  } catch (err) {
    res.status(500).json({ message: "Error fetching cart" });
  }
});

// Add item to cart
router.post('/:userId/add', async (req, res) => {
  try {
    const { item } = req.body;
    let cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) cart = new Cart({ userId: req.params.userId, items: [] });
    const exists = cart.items.find(i => i.productId == item.productId);
    if (exists) {
      exists.quantity += (item.quantity || 1);
    } else {
      cart.items.push({ ...item, quantity: item.quantity || 1 });
    }
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Error adding to cart" });
  }
});

// Remove item from cart
router.post('/:userId/remove', async (req, res) => {
  try {
    const { productId } = req.body;
    const cart = await Cart.findOne({ userId: req.params.userId });
    if (cart) {
      cart.items = cart.items.filter(i => i.productId !== productId);
      await cart.save();
    }
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Error removing from cart" });
  }
});

// Clear cart
router.post('/:userId/clear', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Error clearing cart" });
  }
});

module.exports = router;
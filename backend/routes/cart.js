const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart"); // Make sure this path is correct

// Get cart for user (returns all items for the userId)
router.get("/:userId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    res.json(cart || { userId: req.params.userId, items: [] });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ message: "Failed to get cart", error: error.message });
  }
});

// Save/update cart for user (overwrite items for userId)
router.post("/:userId", async (req, res) => {
  try {
    const { items } = req.body;
    let cart = await Cart.findOne({ userId: req.params.userId });
    if (cart) {
      cart.items = items;
      cart.updatedAt = new Date();
    } else {
      cart = new Cart({ userId: req.params.userId, items });
    }
    await cart.save();
    res.json({ message: "Cart saved successfully", cart });
  } catch (error) {
    console.error("Save cart error:", error);
    res.status(500).json({ message: "Failed to save cart", error: error.message });
  }
});

// Clear cart for user (set items to empty array)
router.delete("/:userId", async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ userId: req.params.userId }, { items: [] });
    res.json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({ message: "Failed to clear cart", error: error.message });
  }
});

module.exports = router;
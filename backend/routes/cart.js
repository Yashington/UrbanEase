const express = require("express");
const router = express.Router();

// Simple in-memory cart storage
const carts = new Map();

// Get cart for user
router.get("/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    const cart = carts.get(userId) || { items: [] };
    console.log(`Fetching cart for user ${userId}:`, cart.items.length, 'items');
    res.json(cart);
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ message: "Failed to get cart", error: error.message });
  }
});

// Save cart for user
router.post("/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    const { items } = req.body;
    
    console.log(`Saving cart for user ${userId}:`, items.length, 'items');
    
    carts.set(userId, { items });
    res.json({ message: "Cart saved successfully" });
  } catch (error) {
    console.error("Save cart error:", error);
    res.status(500).json({ message: "Failed to save cart", error: error.message });
  }
});

// Clear cart for user
router.delete("/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    carts.set(userId, { items: [] });
    console.log(`Cart cleared for user ${userId}`);
    res.json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({ message: "Failed to clear cart", error: error.message });
  }
});

module.exports = router;
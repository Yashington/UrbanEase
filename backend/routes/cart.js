const express = require("express");
const router = express.Router();

// Simple in-memory storage (replace with database in production)
const carts = new Map();

// Get cart for user
router.get("/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    const cart = carts.get(userId) || { items: [] };
    res.json(cart);
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ message: "Failed to get cart" });
  }
});

// Save/Update cart for user
router.post("/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    const { items } = req.body;
    
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: "Items must be an array" });
    }
    
    const cart = { 
      userId, 
      items: items.map(item => ({
        id: item.id,
        productId: item.id,
        title: item.title,
        price: item.price,
        image: item.image,
        category: item.category,
        quantity: item.quantity || 1
      })),
      updatedAt: new Date().toISOString()
    };
    
    carts.set(userId, cart);
    console.log(`Cart updated for user ${userId}: ${items.length} items`);
    
    res.json({ message: "Cart saved successfully", cart });
  } catch (error) {
    console.error("Save cart error:", error);
    res.status(500).json({ message: "Failed to save cart" });
  }
});

// Add item to cart
router.post("/:userId/add", (req, res) => {
  try {
    const { userId } = req.params;
    const { item } = req.body;
    
    if (!item || !item.id) {
      return res.status(400).json({ message: "Invalid item data" });
    }
    
    let cart = carts.get(userId) || { items: [] };
    const existingItem = cart.items.find(i => i.id === item.id);
    
    if (existingItem) {
      existingItem.quantity += (item.quantity || 1);
    } else {
      cart.items.push({
        id: item.id,
        productId: item.id,
        title: item.title,
        price: item.price,
        image: item.image,
        category: item.category,
        quantity: item.quantity || 1
      });
    }
    
    cart.updatedAt = new Date().toISOString();
    carts.set(userId, cart);
    
    res.json({ message: "Item added to cart", cart });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ message: "Failed to add item to cart" });
  }
});

// Remove item from cart
router.delete("/:userId/item/:itemId", (req, res) => {
  try {
    const { userId, itemId } = req.params;
    
    let cart = carts.get(userId) || { items: [] };
    cart.items = cart.items.filter(item => item.id !== itemId);
    cart.updatedAt = new Date().toISOString();
    
    carts.set(userId, cart);
    
    res.json({ message: "Item removed from cart", cart });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ message: "Failed to remove item from cart" });
  }
});

// Clear cart for user
router.delete("/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    carts.set(userId, { items: [], updatedAt: new Date().toISOString() });
    res.json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({ message: "Failed to clear cart" });
  }
});

// Debug endpoint
router.get("/debug/all", (req, res) => {
  const allCarts = Array.from(carts.entries()).map(([userId, cart]) => ({
    userId,
    itemCount: cart.items.length,
    updatedAt: cart.updatedAt
  }));
  res.json({ totalCarts: allCarts.length, carts: allCarts });
});

module.exports = router;
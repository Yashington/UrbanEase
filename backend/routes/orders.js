const express = require("express");
const router = express.Router();

// Simple in-memory storage (replace with database in production)
let orders = [];
let orderIdCounter = 1;

// Get all orders for a user
router.get("/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    const userOrders = orders.filter(order => order.userId === userId);
    res.json(userOrders);
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: "Failed to get orders" });
  }
});

// Create new order
router.post("/", (req, res) => {
  try {
    const orderData = req.body;
    
    // Validate required fields
    if (!orderData.userId || !orderData.products || orderData.products.length === 0) {
      return res.status(400).json({ message: "Missing required fields: userId, products" });
    }

    if (!orderData.total || orderData.total <= 0) {
      return res.status(400).json({ message: "Invalid total amount" });
    }

    // Create order with unique ID
    const order = {
      id: orderIdCounter++,
      userId: orderData.userId,
      products: orderData.products,
      total: orderData.total,
      status: "pending",
      date: new Date().toISOString(),
      shippingAddress: orderData.shippingAddress || {},
      paymentMethod: orderData.paymentMethod || "Cash on Delivery",
      createdAt: new Date().toISOString()
    };

    orders.push(order);
    
    console.log(`Order ${order.id} created successfully for user ${order.userId}`);
    console.log(`Order total: ₹${order.total}`);
    console.log(`Products: ${order.products.length} items`);
    
    res.status(201).json({ 
      message: "Order placed successfully", 
      orderId: order.id,
      order: order
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ message: "Failed to create order. Please try again." });
  }
});

// Get single order by ID
router.get("/order/:orderId", (req, res) => {
  try {
    const { orderId } = req.params;
    const order = orders.find(o => o.id == orderId);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    res.json(order);
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ message: "Failed to get order" });
  }
});

// Update order status
router.patch("/:orderId", (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    const order = orders.find(o => o.id == orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    order.status = status;
    order.updatedAt = new Date().toISOString();
    
    res.json({ message: "Order updated successfully", order });
  } catch (error) {
    console.error("Update order error:", error);
    res.status(500).json({ message: "Failed to update order" });
  }
});

// Debug endpoint to see all orders
router.get("/debug/all", (req, res) => {
  res.json({ 
    totalOrders: orders.length, 
    orders: orders.map(o => ({
      id: o.id,
      userId: o.userId,
      total: o.total,
      status: o.status,
      date: o.date
    }))
  });
});

module.exports = router;
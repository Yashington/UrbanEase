const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Simple in-memory storage (replace with database in production)
let orders = [];
let orderIdCounter = 1;

// Create order (authenticated users only)
router.post('/', authenticate, async (req, res) => {
  try {
    const orderData = req.body;
    
    // Validate required fields
    if (!orderData.products || orderData.products.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order must contain at least one product' 
      });
    }

    if (!orderData.total || orderData.total <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid total amount' 
      });
    }

    // Create order with authenticated user's ID
    const order = {
      id: orderIdCounter++,
      userId: req.user._id,
      userEmail: req.user.email,
      userName: req.user.name,
      products: orderData.products,
      total: orderData.total,
      status: 'pending',
      paymentMethod: orderData.paymentMethod || 'cash_on_delivery',
      shippingAddress: orderData.shippingAddress || {},
      orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    orders.push(order);
    
    console.log(`✅ Order ${order.id} created successfully for ${req.user.name} (${req.user.email})`);
    console.log(`💰 Order total: ₹${order.total}`);
    console.log(`📦 Products: ${order.products.length} items`);
    
    res.status(201).json({ 
      success: true,
      message: 'Order placed successfully', 
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        order: order
      }
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create order. Please try again.',
      error: error.message 
    });
  }
});

// Get user's orders
router.get('/my-orders', authenticate, async (req, res) => {
  try {
    const userOrders = orders.filter(order => order.userId.toString() === req.user._id.toString());
    
    res.json({
      success: true,
      data: {
        orders: userOrders,
        total: userOrders.length
      }
    });
  } catch (error) {
    console.error('Fetch orders error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get orders',
      error: error.message 
    });
  }
});

// Get single order
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = orders.find(o => 
      o.id == req.params.id && 
      o.userId.toString() === req.user._id.toString()
    );
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error('Fetch order error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get order',
      error: error.message 
    });
  }
});

// Update order status (admin only)
router.patch('/:id/status', authenticate, authorize('admin', 'moderator'), async (req, res) => {
  try {
    const { status } = req.body;
    
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const order = orders.find(o => o.id == req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.status = status;
    order.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order',
      error: error.message
    });
  }
});

// Get all orders (admin only)
router.get('/admin/all', authenticate, authorize('admin'), async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        orders: orders,
        total: orders.length
      }
    });
  } catch (error) {
    console.error('Admin fetch orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get orders',
      error: error.message
    });
  }
});

// Debug endpoint
router.get('/debug/all', (req, res) => {
  res.json({ 
    totalOrders: orders.length, 
    orders: orders.map(o => ({
      id: o.id,
      userId: o.userId,
      userEmail: o.userEmail,
      total: o.total,
      status: o.status,
      orderNumber: o.orderNumber,
      createdAt: o.createdAt
    }))
  });
});

module.exports = router;
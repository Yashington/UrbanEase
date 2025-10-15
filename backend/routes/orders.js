module.exports = function (io) {
  const express = require("express");
  const { authenticate, authorize } = require("../middleware/auth");
  const Order = require("../models/Order");
  const Cart = require("../models/Cart");
  const Notification = require("../models/Notification"); // NEW: persist + emit notifications

  const router = express.Router();

  // Allowed statuses including "out-for-delivery" for Amazon-like flow
  const allowedStatuses = [
    "pending",
    "processing",
    "shipped",
    "out-for-delivery",
    "delivered",
    "cancelled",
  ];

  // Create order (authenticated users only, saves to MongoDB)
  router.post("/", authenticate, async (req, res) => {
    try {
      const orderData = req.body;

      // Validate required fields
      if (!orderData.products || orderData.products.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Order must contain at least one product",
        });
      }
      if (!orderData.total || orderData.total <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid total amount",
        });
      }

      // Create and save order in MongoDB
      const order = new Order({
        userId: req.user._id,
        products: orderData.products,
        total: orderData.total,
        status: "pending", // initial status
        paymentMethod: orderData.paymentMethod || "cash_on_delivery",
        shippingAddress: orderData.shippingAddress || {},
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await order.save();

      // Clear the user's cart in MongoDB after successful order
      await Cart.findOneAndUpdate({ userId: req.user._id }, { items: [] });

      res.status(201).json({
        success: true,
        message: "Order placed successfully",
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          order,
        },
      });
    } catch (error) {
      console.error("Order creation error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create order. Please try again.",
        error: error.message,
      });
    }
  });

  // Get user's orders (from MongoDB)
  router.get("/my-orders", authenticate, async (req, res) => {
    try {
      const userOrders = await Order.find({ userId: req.user._id }).sort({
        createdAt: -1,
      });
      res.json({
        success: true,
        data: {
          orders: userOrders,
          total: userOrders.length,
        },
      });
    } catch (error) {
      console.error("Fetch orders error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get orders",
        error: error.message,
      });
    }
  });

  // Get single order (from MongoDB)
  router.get("/:id", authenticate, async (req, res) => {
    try {
      const order = await Order.findOne({
        _id: req.params.id,
        userId: req.user._id,
      });
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }
      res.json({
        success: true,
        data: { order },
      });
    } catch (error) {
      console.error("Fetch order error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get order",
        error: error.message,
      });
    }
  });

  // Update order status (admin/moderator only, updates MongoDB)
  router.patch(
    "/:id/status",
    authenticate,
    authorize("admin", "moderator"),
    async (req, res) => {
      try {
        const { status } = req.body;
        if (!allowedStatuses.includes(String(status))) {
          return res.status(400).json({
            success: false,
            message: "Invalid status",
          });
        }

        const order = await Order.findByIdAndUpdate(
          req.params.id,
          { status, updatedAt: new Date() },
          { new: true }
        );

        if (!order) {
          return res.status(404).json({
            success: false,
            message: "Order not found",
          });
        }

        const userRoom = order.userId?.toString();

        // Persist a notification for the user
        let notifPayload = null;
        try {
          const notif = await Notification.create({
            user: order.userId,
            type: "order-status",
            title: "Order status updated",
            message: `Your order ${order._id} is now ${status}.`,
            order: order._id,
            status,
            read: false,
          });

          notifPayload = {
            _id: notif._id,
            type: notif.type,
            title: notif.title,
            message: notif.message,
            order: notif.order,
            status: notif.status,
            read: notif.read,
            createdAt: notif.createdAt,
          };
        } catch (e) {
          // If Notification model not available or fails, continue with socket emit only
          console.warn("Notification create failed:", e?.message || e);
        }

        // Socket.IO Real-Time Updates: emit to the user's room
        if (userRoom) {
          // Backward-compatible event your client already listens to
          io.to(userRoom).emit("order status update", {
            orderId: order._id.toString(),
            status: order.status,
            updatedAt: order.updatedAt,
          });

          // New structured notification event (for Notifications page + navbar badge)
          io.to(userRoom).emit(
            "notification:new",
            notifPayload || {
              // fallback if DB save failed
              title: "Order status updated",
              message: `Your order ${order._id} is now ${status}.`,
              type: "order-status",
              order: order._id,
              status,
              read: false,
              createdAt: new Date().toISOString(),
            }
          );
        }

        res.json({
          success: true,
          message: "Order status updated successfully",
          data: { order },
        });
      } catch (error) {
        console.error("Update order error:", error);
        res.status(500).json({
          success: false,
          message: "Failed to update order",
          error: error.message,
        });
      }
    }
  );

  // Get all orders (admin/moderator only, from MongoDB)
  router.get(
    "/admin/all",
    authenticate,
    authorize("admin", "moderator"),
    async (req, res) => {
      try {
        const allOrders = await Order.find({}).sort({ createdAt: -1 });
        res.json({
          success: true,
          data: {
            orders: allOrders,
            total: allOrders.length,
          },
        });
      } catch (error) {
        console.error("Admin fetch orders error:", error);
        res.status(500).json({
          success: false,
          message: "Failed to get orders",
          error: error.message,
        });
      }
    }
  );

  return router;
};
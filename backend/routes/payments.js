const express = require("express");
const Order = require("../models/Order");
let Notification;
try {
  Notification = require("../models/Notification");
} catch (_) {
  // Notification model is optional
}
const { authenticate } = require("../middleware/auth");

const router = express.Router();

const UPI_VPA = process.env.UPI_VPA || "urbanease@upi";
const UPI_NAME = process.env.UPI_NAME || "UrbanEase";

// Build a UPI URI (mock)
function buildUpiUri({ vpa, name, amount, note }) {
  const params = new URLSearchParams({
    pa: vpa,
    pn: name || "Merchant",
    am: String(amount || 0),
    cu: "INR",
  });
  if (note) params.set("tn", note.slice(0, 40));
  return `upi://pay?${params.toString()}`;
}

/**
 * POST /api/payments/initiate
 * body: { orderId }
 * returns: { upiUri, vpa, payeeName, amount, note }
 */
router.post("/initiate", authenticate, async (req, res) => {
  try {
    const { orderId } = req.body || {};
    if (!orderId) return res.status(400).json({ success: false, message: "orderId is required" });

    const order = await Order.findOne({ _id: orderId, userId: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const amount = Number(order.total || 0);
    const note = `Order ${order._id}`;
    const upiUri = buildUpiUri({ vpa: UPI_VPA, name: UPI_NAME, amount, note });

    // Ensure payment status is pending until user confirms on UPI page
    if (!order.payment || !order.payment.status) {
      order.payment = {
        method: "upi",
        status: "pending",
      };
      await order.save();
    }

    return res.json({
      success: true,
      data: {
        upiUri,
        vpa: UPI_VPA,
        payeeName: UPI_NAME,
        amount,
        note,
      },
    });
  } catch (e) {
    console.error("Initiate payment error:", e);
    return res.status(500).json({ success: false, message: "Failed to initiate payment" });
  }
});

/**
 * POST /api/payments/confirm
 * body: { orderId, method: 'upi', reference?: string }
 * Marks order as paid and moves status forward (Processing).
 */
router.post("/confirm", authenticate, async (req, res) => {
  try {
    const { orderId, method = "upi", reference } = req.body || {};
    if (!orderId) {
      return res.status(400).json({ success: false, message: "orderId is required" });
    }

    const order = await Order.findOne({ _id: orderId, userId: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    order.payment = {
      ...(order.payment || {}),
      method,
      status: "paid",
      reference: reference || order.payment?.reference,
      paidAt: new Date(),
    };
    order.status = "processing";
    order.updatedAt = new Date();
    await order.save();

    // Optional notification
    try {
      const io = req.app.get("io");
      if (io) {
        io.to(String(order.userId)).emit("notification:new", {
          title: "Payment received",
          message: `Your payment for order ${order._id} was marked as paid.`,
          type: "order-status",
          order: order._id,
          status: "Paid",
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
      if (Notification) {
        await Notification.create({
          user: order.userId,
          type: "order-status",
          title: "Payment received",
          message: `Your payment for order ${order._id} was marked as paid.`,
          order: order._id,
          status: "Paid",
          read: false,
        });
      }
    } catch (_) {}

    return res.json({ success: true, message: "Payment confirmed", data: { order } });
  } catch (e) {
    console.error("Confirm payment error:", e);
    return res.status(500).json({ success: false, message: "Failed to confirm payment" });
  }
});

/**
 * POST /api/payments/select-cod
 * body: { orderId }
 * Switches the order to COD and proceeds with processing.
 */
router.post("/select-cod", authenticate, async (req, res) => {
  try {
    const { orderId } = req.body || {};
    if (!orderId) return res.status(400).json({ success: false, message: "orderId is required" });

    const order = await Order.findOne({ _id: orderId, userId: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    order.payment = { method: "cod", status: "cod" };
    order.status = "processing";
    order.updatedAt = new Date();
    await order.save();

    try {
      const io = req.app.get("io");
      if (io) {
        io.to(String(order.userId)).emit("notification:new", {
          title: "COD selected",
          message: `Your order ${order._id} will be paid on delivery.`,
          type: "order-status",
          order: order._id,
          status: "COD",
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
      if (Notification) {
        await Notification.create({
          user: order.userId,
          type: "order-status",
          title: "COD selected",
          message: `Your order ${order._id} will be paid on delivery.`,
          order: order._id,
          status: "COD",
          read: false,
        });
      }
    } catch (_) {}

    return res.json({ success: true, message: "COD selected", data: { order } });
  } catch (e) {
    console.error("Select COD error:", e);
    return res.status(500).json({ success: false, message: "Failed to set COD" });
  }
});

module.exports = router;
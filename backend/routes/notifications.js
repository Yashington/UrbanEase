const express = require("express");
const Notification = require("../models/Notification");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

/**
 * GET /api/notifications
 * - Users: get own notifications
 * - Admins: optional ?userId=<id> to view a user's notifications (moderation)
 */
router.get("/", authenticate, async (req, res) => {
  try {
    const isAdmin = ["admin", "moderator"].includes(req.user?.role);
    const userId = isAdmin && req.query.userId ? req.query.userId : req.user._id;

    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || "20", 10)));
    const skip = (page - 1) * limit;

    const [items, total, unread] = await Promise.all([
      Notification.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments({ user: userId }),
      Notification.countDocuments({ user: userId, read: false }),
    ]);

    res.json({
      data: { notifications: items, page, pageSize: limit, total, totalPages: Math.ceil(total / limit), unread },
    });
  } catch (e) {
    console.error("List notifications error:", e);
    res.status(500).json({ success: false, message: "Failed to get notifications" });
  }
});

/**
 * GET /api/notifications/unread-count
 * - Quick unread count for badges
 */
router.get("/unread-count", authenticate, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ user: req.user._id, read: false });
    res.json({ data: { unread: count } });
  } catch (e) {
    console.error("Unread count error:", e);
    res.status(500).json({ success: false, message: "Failed to get unread count" });
  }
});

/**
 * PATCH /api/notifications/:id/read
 * - Mark a single notification as read
 */
router.patch("/:id/read", authenticate, async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: { read: true } },
      { new: true }
    );
    if (!notif) return res.status(404).json({ success: false, message: "Notification not found" });
    res.json({ success: true, data: { notification: notif } });
  } catch (e) {
    console.error("Mark read error:", e);
    res.status(500).json({ success: false, message: "Failed to mark notification as read" });
  }
});

/**
 * POST /api/notifications/mark-all-read
 * - Mark all user notifications as read
 */
router.post("/mark-all-read", authenticate, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { $set: { read: true } });
    res.json({ success: true });
  } catch (e) {
    console.error("Mark all read error:", e);
    res.status(500).json({ success: false, message: "Failed to mark all as read" });
  }
});

module.exports = router;
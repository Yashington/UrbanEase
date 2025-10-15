const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["order-status", "general"], default: "order-status", index: true },
    title: { type: String, required: true },
    message: { type: String, default: "" },

    // Optional context for UI deep-links
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    status: { type: String }, // e.g., "Processing", "Shipped", "Delivered", "Cancelled"

    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
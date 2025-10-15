const mongoose = require('mongoose');

// Payment subdocument for mock/real flows
const paymentSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: ['upi', 'gpay', 'cod', 'card', 'netbanking', 'wallet'],
      default: 'upi',
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'cod'],
      default: 'pending',
      index: true,
    },
    reference: { type: String },      // user-entered reference/UTR (optional)
    proofDataUrl: { type: String },   // base64 screenshot (demo only)
    paidAt: { type: Date },           // when marked paid
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    products: [
      {
        productId: {
          type: String,
          required: [true, 'Product ID is required'],
        },
        quantity: {
          type: Number,
          required: [true, 'Quantity is required'],
          min: [1, 'Quantity must be at least 1'],
        },
        price: {
          type: Number,
          required: [true, 'Price is required'],
          min: [0, 'Price cannot be negative'],
        },
        title: String,
        image: String,
        category: String,
      },
    ],
    total: {
      type: Number,
      required: [true, 'Total is required'],
      min: [0, 'Total cannot be negative'],
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'out-for-delivery', 'delivered', 'cancelled'],
      default: 'pending',
      index: true,
    },

    // Kept for backward compatibility with existing code paths
    paymentMethod: {
      type: String,
      default: 'cash_on_delivery',
    },

    // New payment details (used by PaymentPage and mock confirmations)
    payment: paymentSchema,

    shippingAddress: {
      name: {
        type: String,
        required: [true, 'Shipping name is required'],
      },
      address: {
        type: String,
        required: [true, 'Shipping address is required'],
      },
      phone: {
        type: String,
        required: [true, 'Phone number is required'],
      },
      email: String,
    },
    orderNumber: {
      type: String,
      unique: true,
    },
    estimatedDelivery: Date,
    actualDelivery: Date,
  },
  {
    timestamps: true,
  }
);

// Helpful compound index for admin/user views
orderSchema.index({ userId: 1, createdAt: -1 });

// Generate order number before saving
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    this.orderNumber =
      'ORD-' +
      Date.now() +
      '-' +
      Math.random().toString(36).substr(2, 6).toUpperCase() +
      '-' +
      this.userId.toString().slice(-4);
  }
  next();
});

// (Optional) Static method to fetch all orders for admin
orderSchema.statics.fetchAllOrders = function () {
  return this.find({}).sort({ createdAt: -1 });
};

// (Optional) Static method to fetch orders by user
orderSchema.statics.fetchUserOrders = function (userId) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('Order', orderSchema);
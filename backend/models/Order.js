const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  products: [{
    productId: {
      type: String,
      required: [true, 'Product ID is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    title: String,
    image: String,
    category: String
  }],
  total: {
    type: Number,
    required: [true, 'Total is required'],
    min: [0, 'Total cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    default: 'cash_on_delivery'
  },
  shippingAddress: {
    name: {
      type: String,
      required: [true, 'Shipping name is required']
    },
    address: {
      type: String,
      required: [true, 'Shipping address is required']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required']
    },
    email: String
  },
  orderNumber: {
    type: String,
    unique: true
  },
  estimatedDelivery: Date,
  actualDelivery: Date
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    this.orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
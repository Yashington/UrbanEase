const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: String,
  products: [
    {
      productId: String,
      quantity: Number,
      price: Number,
      title: String,
      image: String,
      category: String,
    }
  ],
  total: Number,
  paymentMethod: String,
  address: String,
  phone: String,
  date: String,
});

module.exports = mongoose.model('Order', orderSchema);
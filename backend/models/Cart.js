const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [
    {
      productId: String,
      quantity: Number,
      price: Number,
      title: String,
      image: String,
      category: String,
    }
  ]
});

module.exports = mongoose.model('Cart', cartSchema);
const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  cart: [
    {
      productId: { type: Number, required: true },
      count: { type: Number, required: true },
      color: { type: String, required: false },
      size: { type: String, required: false },
    },
  ],
});

const Cart = mongoose.model('carts', cartSchema);

module.exports = Cart;
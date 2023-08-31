const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  orders: [
    {
      id: { type: Number, required: true },
      orderNumber: { type: String, required: true },
      date: { type: Date, required: true },
      status: { type: String, required: true },
      items: [
        {
          id: { type: Number, required: true },
          name: { type: String, required: true },
          quantity: { type: Number, required: true },
          price: { type: Number, required: true },
        },
      ],
      totalAmount: { type: Number, required: true },
    },
  ],
});

const Order = mongoose.model('orders', orderSchema);

module.exports = Order;

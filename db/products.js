const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  condition: { type: String, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  rating: { type: Number, required: true },
  totalRatings: { type: Number, required: true },
  discount: { type: Number },
  previousPrice: { type: Number },
  currentPrice: { type: Number, required: true },
  colors: [{
    name: { type: String, required: true },
    imgURL: { type: String, required: true },
    count: [{ type: Number, required: true }],
  }],
  sizes: [{ type: String }],
  description: [{ type: String }],
  deliveryAddress: { type: String },
  inStock: { type: Boolean, required: true },
  totalSold: { type: Number, required: true },
  quantity: { type: Number, required: true },
  return: { type: Number },
});

const Product = mongoose.model('products', productSchema);

module.exports = Product;

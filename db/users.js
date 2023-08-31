const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  contact: {
    type: String,
    required: false
  },
  address: {
    type: String,
    required: false
  },
  deliveryAddress: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    required: false,
    default: ''
  }
});

module.exports = mongoose.model('users', userSchema);

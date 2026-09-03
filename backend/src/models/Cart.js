const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  weight_id: { type: String },
  name: String,
  image_url: String,
  weight: String,
  unit_price: Number,
  quantity: { type: Number, default: 1 },
  total_price: Number,
});

const CartSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  items: [CartItemSchema],
}, { timestamps: true });

module.exports = mongoose.model('Cart', CartSchema);

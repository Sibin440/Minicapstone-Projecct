const mongoose = require('mongoose');

const ProductWeightSchema = new mongoose.Schema({
  weight: { type: String, required: true },
  price: { type: Number, required: true },
});

const ProductSchema = new mongoose.Schema({
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  image_url: { type: String, default: '' },
  base_price: { type: Number, required: true },
  discount_percent: { type: Number, default: 0 },
  is_bestseller: { type: Number, default: 0 },
  is_new: { type: Number, default: 0 },
  is_offer: { type: Number, default: 0 },
  rating: { type: Number, default: 4.5 },
  rating_count: { type: Number, default: 0 },
  is_active: { type: Number, default: 1 },
  stock_qty: { type: Number, default: 30 },
  low_stock_threshold: { type: Number, default: 10 },
  weights: [ProductWeightSchema],
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);

const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  image_url: { type: String, default: '' },
  icon: { type: String, default: '' },
  display_order: { type: Number, default: 0 },
  is_active: { type: Number, default: 1 },
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);

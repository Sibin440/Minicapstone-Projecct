const Product = require('../models/Product');

// Simple wishlist stored per user in a dedicated model
const mongoose = require('mongoose');
const WishlistSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
}, { timestamps: true });
const Wishlist = mongoose.models.Wishlist || mongoose.model('Wishlist', WishlistSchema);

exports.getWishlist = async (req, res) => {
  try {
    const items = await Wishlist.find({ user_id: req.user.id }).populate('product_id').lean();
    const products = items.map(w => ({ ...w.product_id, id: w.product_id?._id })).filter(Boolean);
    res.json({ success: true, wishlist: products, count: products.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleWishlist = async (req, res) => {
  try {
    const { product_id } = req.body;
    const existing = await Wishlist.findOne({ user_id: req.user.id, product_id });
    if (existing) {
      await existing.deleteOne();
      return res.json({ success: true, action: 'removed' });
    }
    await Wishlist.create({ user_id: req.user.id, product_id });
    res.json({ success: true, action: 'added' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

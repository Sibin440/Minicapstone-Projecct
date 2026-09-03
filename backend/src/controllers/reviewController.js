// Simple reviews using mongoose inline schema
const mongoose = require('mongoose');
const ReviewSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, required: true },
  title: { type: String, default: '' },
  body: { type: String, default: '' },
}, { timestamps: true });
const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);

exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product_id: req.params.productId }).populate('user_id', 'name').lean();
    const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
    res.json({ success: true, reviews: reviews.map(r => ({ ...r, id: r._id, user_name: r.user_id?.name })), avg_rating: avg.toFixed(1), total: reviews.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addReview = async (req, res) => {
  try {
    const { rating, title, body } = req.body;
    const review = await Review.create({ product_id: req.params.productId, user_id: req.user.id, rating, title, body });
    res.status(201).json({ success: true, review: { ...review.toObject(), id: review._id } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

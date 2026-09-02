const { getDb } = require('../models/db');

exports.getProductReviews = (req, res) => {
  const db = getDb();
  const reviews = db.prepare(`SELECT r.*, u.name as user_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id = ? ORDER BY r.created_at DESC`).all(req.params.productId);
  const stats = db.prepare('SELECT AVG(rating) as avg_rating, COUNT(*) as total FROM reviews WHERE product_id = ?').get(req.params.productId);
  res.json({ success: true, reviews, stats: { avg_rating: Math.round((stats.avg_rating || 0) * 10) / 10, total: stats.total } });
};

exports.addReview = (req, res) => {
  const db = getDb();
  const { rating, title, body } = req.body;
  const productId = req.params.productId;
  if (!rating) return res.status(400).json({ success: false, message: 'Rating is required' });
  const product = db.prepare('SELECT id FROM products WHERE id = ?').get(productId);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  try {
    db.prepare('INSERT INTO reviews (user_id, product_id, rating, title, body) VALUES (?, ?, ?, ?, ?)').run(req.user.id, productId, rating, title || null, body || null);
    const avg = db.prepare('SELECT AVG(rating) as avg FROM reviews WHERE product_id = ?').get(productId);
    db.prepare('UPDATE products SET rating = ?, rating_count = rating_count + 1 WHERE id = ?').run(Math.round(avg.avg * 10) / 10, productId);
    const review = db.prepare('SELECT r.*, u.name as user_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id = ? AND r.user_id = ?').get(productId, req.user.id);
    res.status(201).json({ success: true, review });
  } catch (e) {
    res.status(409).json({ success: false, message: 'You have already reviewed this product' });
  }
};

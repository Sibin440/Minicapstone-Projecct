const { getDb } = require('../models/db');

exports.getWishlist = (req, res) => {
  const db = getDb();
  const items = db.prepare(`
    SELECT w.id, w.created_at, p.*, c.name as category_name
    FROM wishlist w
    JOIN products p ON w.product_id = p.id
    JOIN categories c ON p.category_id = c.id
    WHERE w.user_id = ? AND p.is_active = 1
    ORDER BY w.created_at DESC
  `).all(req.user.id);
  items.forEach(p => {
    p.weights = db.prepare('SELECT * FROM product_weights WHERE product_id = ? ORDER BY price ASC').all(p.id);
  });
  res.json({ success: true, items });
};

exports.addToWishlist = (req, res) => {
  const db = getDb();
  const { product_id } = req.body;
  const product = db.prepare('SELECT id FROM products WHERE id = ? AND is_active = 1').get(product_id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  try {
    db.prepare('INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)').run(req.user.id, product_id);
    res.json({ success: true, message: 'Added to wishlist' });
  } catch (e) {
    res.json({ success: true, message: 'Already in wishlist' });
  }
};

exports.removeFromWishlist = (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?').run(req.user.id, req.params.productId);
  res.json({ success: true, message: 'Removed from wishlist' });
};

exports.checkWishlist = (req, res) => {
  const db = getDb();
  const item = db.prepare('SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?').get(req.user.id, req.params.productId);
  res.json({ success: true, in_wishlist: !!item });
};

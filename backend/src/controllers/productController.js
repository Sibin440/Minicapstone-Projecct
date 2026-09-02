const { getDb } = require('../models/db');

const withWeights = (db, products) => {
  return products.map(p => ({
    ...p,
    weights: db.prepare('SELECT * FROM product_weights WHERE product_id = ? ORDER BY price ASC').all(p.id),
    discounted_price: p.base_price * (1 - p.discount_percent / 100)
  }));
};

exports.getAllProducts = (req, res) => {
  const db = getDb();
  const { category, search, sort, min_price, max_price, bestseller, is_offer, page = 1, limit = 12 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  let where = 'p.is_active = 1';
  const params = [];
  if (category) { where += ' AND c.slug = ?'; params.push(category); }
  if (search) { where += ' AND (p.name LIKE ? OR p.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  if (bestseller === 'true') { where += ' AND p.is_bestseller = 1'; }
  if (is_offer === 'true') { where += ' AND p.is_offer = 1'; }
  if (min_price) { where += ' AND p.base_price >= ?'; params.push(parseFloat(min_price)); }
  if (max_price) { where += ' AND p.base_price <= ?'; params.push(parseFloat(max_price)); }
  let orderBy = 'p.is_bestseller DESC, p.rating DESC';
  if (sort === 'price_asc') orderBy = 'p.base_price ASC';
  else if (sort === 'price_desc') orderBy = 'p.base_price DESC';
  else if (sort === 'rating') orderBy = 'p.rating DESC';
  else if (sort === 'newest') orderBy = 'p.created_at DESC';
  const base = `FROM products p JOIN categories c ON p.category_id = c.id WHERE ${where}`;
  const total = db.prepare(`SELECT COUNT(*) as total ${base}`).get(...params).total;
  const rows = db.prepare(`SELECT p.*, c.name as category_name, c.slug as category_slug ${base} ORDER BY ${orderBy} LIMIT ? OFFSET ?`).all(...params, parseInt(limit), offset);
  res.json({ success: true, products: withWeights(db, rows), total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
};

exports.getProductById = (req, res) => {
  const db = getDb();
  const p = db.prepare(`SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p JOIN categories c ON p.category_id = c.id WHERE p.id = ? AND p.is_active = 1`).get(req.params.id);
  if (!p) return res.status(404).json({ success: false, message: 'Product not found' });
  p.weights = db.prepare('SELECT * FROM product_weights WHERE product_id = ? ORDER BY price ASC').all(p.id);
  p.discounted_price = p.base_price * (1 - p.discount_percent / 100);
  p.reviews = db.prepare(`SELECT r.*, u.name as user_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id = ? ORDER BY r.created_at DESC LIMIT 10`).all(p.id);
  res.json({ success: true, product: p });
};

exports.getProductBySlug = (req, res) => {
  const db = getDb();
  const p = db.prepare(`SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p JOIN categories c ON p.category_id = c.id WHERE p.slug = ? AND p.is_active = 1`).get(req.params.slug);
  if (!p) return res.status(404).json({ success: false, message: 'Product not found' });
  p.weights = db.prepare('SELECT * FROM product_weights WHERE product_id = ? ORDER BY price ASC').all(p.id);
  p.discounted_price = p.base_price * (1 - p.discount_percent / 100);
  p.reviews = db.prepare(`SELECT r.*, u.name as user_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id = ? ORDER BY r.created_at DESC LIMIT 10`).all(p.id);
  res.json({ success: true, product: p });
};

exports.getFeaturedProducts = (req, res) => {
  const db = getDb();
  const base = `SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.is_active = 1`;
  const bestsellers = withWeights(db, db.prepare(`${base} AND p.is_bestseller = 1 LIMIT 8`).all());
  const offers = withWeights(db, db.prepare(`${base} AND p.is_offer = 1 LIMIT 6`).all());
  const newest = withWeights(db, db.prepare(`${base} AND p.is_new = 1 LIMIT 6`).all());
  res.json({ success: true, bestsellers, offers, newest });
};

exports.searchProducts = (req, res) => {
  const db = getDb();
  const { q } = req.query;
  if (!q) return res.json({ success: true, products: [] });
  const rows = db.prepare(`SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.is_active = 1 AND (p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?) ORDER BY p.is_bestseller DESC, p.rating DESC LIMIT 10`).all(`%${q}%`, `%${q}%`, `%${q}%`);
  res.json({ success: true, products: withWeights(db, rows) });
};

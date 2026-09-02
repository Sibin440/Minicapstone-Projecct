const { getDb } = require('../models/db');

exports.getAllCategories = (req, res) => {
  const db = getDb();
  const categories = db.prepare('SELECT * FROM categories WHERE is_active = 1 ORDER BY display_order ASC').all();
  categories.forEach(cat => {
    const row = db.prepare('SELECT COUNT(*) as c FROM products WHERE category_id = ? AND is_active = 1').get(cat.id);
    cat.product_count = row ? row.c : 0;
  });
  res.json({ success: true, categories });
};

exports.getCategoryBySlug = (req, res) => {
  const db = getDb();
  const category = db.prepare('SELECT * FROM categories WHERE slug = ? AND is_active = 1').get(req.params.slug);
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  res.json({ success: true, category });
};

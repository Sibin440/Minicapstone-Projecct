const Category = require('../models/Category');
const Product = require('../models/Product');

exports.getAll = async (req, res) => {
  try {
    const cats = await Category.find({ is_active: 1 }).sort({ display_order: 1 });
    const withCount = await Promise.all(cats.map(async (c) => {
      const count = await Product.countDocuments({ category_id: c._id, is_active: 1 });
      return { ...c.toObject(), id: c._id, product_count: count };
    }));
    res.json({ success: true, categories: withCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

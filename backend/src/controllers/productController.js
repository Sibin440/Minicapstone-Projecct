const Product = require('../models/Product');
const Category = require('../models/Category');

exports.getAll = async (req, res) => {
  try {
    const { category, search, bestseller, sort, max_price } = req.query;
    let filter = { is_active: 1 };

    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) filter.category_id = cat._id;
    }
    if (bestseller) filter.is_bestseller = 1;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
    if (max_price) filter.base_price = { $lte: Number(max_price) };

    let query = Product.find(filter).populate('category_id', 'name slug');

    if (sort === 'price_asc') query = query.sort({ base_price: 1 });
    else if (sort === 'price_desc') query = query.sort({ base_price: -1 });
    else if (sort === 'rating') query = query.sort({ rating: -1 });
    else if (sort === 'newest') query = query.sort({ createdAt: -1 });
    else query = query.sort({ rating_count: -1 });

    const products = await query.lean();
    const formatted = products.map(p => ({
      ...p, id: p._id,
      category_name: p.category_id?.name,
      category_slug: p.category_id?.slug,
    }));
    res.json({ success: true, products: formatted, total: formatted.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getFeatured = async (req, res) => {
  try {
    const bestsellers = await Product.find({ is_active: 1, is_bestseller: 1 }).limit(8).lean();
    const offers = await Product.find({ is_active: 1, is_offer: 1 }).limit(8).lean();
    const newest = await Product.find({ is_active: 1, is_new: 1 }).sort({ createdAt: -1 }).limit(8).lean();
    const fmt = (arr) => arr.map(p => ({ ...p, id: p._id }));
    res.json({ success: true, bestsellers: fmt(bestsellers), offers: fmt(offers), newest: fmt(newest) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, is_active: 1 }).populate('category_id', 'name slug').lean();
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product: { ...product, id: product._id, category_name: product.category_id?.name, category_slug: product.category_id?.slug } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product: { ...product, id: product._id } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.search = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, products: [] });
    const products = await Product.find({
      is_active: 1,
      $or: [{ name: { $regex: q, $options: 'i' } }, { description: { $regex: q, $options: 'i' } }],
    }).limit(10).lean();
    res.json({ success: true, products: products.map(p => ({ ...p, id: p._id })) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

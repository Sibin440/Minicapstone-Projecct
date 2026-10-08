const Product = require('../models/Product');
const Category = require('../models/Category');

const STOP_WORDS = new Set([
  'what', 'is', 'are', 'the', 'for', 'do', 'you', 'have', 'show', 'me', 'any', 'which',
  'best', 'give', 'i', 'want', 'to', 'buy', 'can', 'tell', 'about', 'some', 'please',
  'with', 'in', 'of', 'on', 'at', 'a', 'an', 'items', 'item', 'products', 'product',
  'good', 'options', 'available', 'available?', 'select', 'find', 'recommend', 'suggestion'
]);

const CATEGORY_MAP = {
  sweets: ['sweets', 'sweet', 'mithai', 'ladoo', 'laddu', 'jamun', 'katli', 'pak', 'rasgulla', 'halwa', 'pedha', 'peda', 'rasmalai', 'ras malai', 'dessert'],
  cakes: ['cakes', 'cake', 'pastry', 'pastries', 'cupcake', 'truffle', 'drip', 'vanilla', 'fudge'],
  savouries: ['savouries', 'savoury', 'namkeen', 'murukku', 'chakli', 'pakoda', 'sev', 'mixture'],
  snacks: ['snacks', 'snack', 'chips', 'peanuts', 'chivda', 'khakhra', 'mathri'],
  'cookies-biscuits': ['cookies', 'cookie', 'biscuits', 'biscuit', 'nankhatai', 'atta', 'jeera'],
  breads: ['breads', 'bread', 'loaf', 'sourdough', 'pav', 'bun', 'toast', 'garlic'],
  beverages: ['beverages', 'beverage', 'drinks', 'drink', 'chai', 'tea', 'coffee', 'badam', 'sharbat', 'milk']
};

function parseQueryIntent(rawQuery) {
  if (!rawQuery) return { tokens: [], maxPrice: null, categorySlug: null, isBestseller: false, isOffer: false };
  const lower = rawQuery.toLowerCase().trim();

  // Price extraction e.g. "under 500", "below 300", "less than 200", "rs 400"
  let maxPrice = null;
  const priceMatch = lower.match(/(?:under|below|less\s+than|rs\.?|₹)\s*(\d+)/i) || lower.match(/(\d+)\s*(?:rs|rupees|inr)/i);
  if (priceMatch && priceMatch[1]) {
    maxPrice = parseInt(priceMatch[1], 10);
  }

  // Category intent
  let categorySlug = null;
  for (const [slug, keywords] of Object.entries(CATEGORY_MAP)) {
    if (keywords.some(kw => lower.includes(kw))) {
      categorySlug = slug;
      break;
    }
  }

  // Feature intent
  const isBestseller = /best\s*seller|popular|famous|top\s*rated|best/i.test(lower);
  const isOffer = /offer|discount|cheap|deal|budget/i.test(lower);

  // Extract search tokens
  const tokens = lower
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1 && !STOP_WORDS.has(t));

  return { tokens, maxPrice, categorySlug, isBestseller, isOffer };
}

async function smartQuerySearch(rawQuery) {
  const { tokens, maxPrice, categorySlug, isBestseller, isOffer } = parseQueryIntent(rawQuery);
  const lower = rawQuery.toLowerCase().trim();

  let products = await Product.find({ is_active: 1 }).populate('category_id', 'name slug').lean();
  let categories = await Category.find().lean();
  const categoryIdMap = {};
  categories.forEach(c => { categoryIdMap[c._id.toString()] = c; });

  const scored = products.map(p => {
    let score = 0;
    const pName = p.name.toLowerCase();
    const pDesc = (p.description || '').toLowerCase();
    const catSlug = p.category_id?.slug || '';
    const catName = (p.category_id?.name || '').toLowerCase();

    // Exact name match or query contains full product name
    if (lower.includes(pName) || pName.includes(lower)) {
      score += 100;
    }

    // Token matching
    let tokenMatchesInDesc = 0;
    tokens.forEach(tok => {
      if (pName.includes(tok)) score += 40;
      if (catName.includes(tok) || catSlug.includes(tok)) score += 15;
      if (pDesc.includes(tok)) {
        score += 25;
        tokenMatchesInDesc++;
      }
    });

    // Category match bonus
    if (categorySlug && catSlug === categorySlug && tokenMatchesInDesc <= 1) {
      score += 30;
    }

    // Bestseller / offer match
    if (isBestseller && p.is_bestseller) score += 20;
    if (isOffer && (p.is_offer || p.discount_percent > 0)) score += 20;

    // Price match score bonus
    if (maxPrice) {
      if (p.base_price <= maxPrice) score += 25;
      else score -= 50; // penalty if above price budget requested
    }

    return { product: p, score };
  });

  // Filter positive scores
  let matches = scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score).map(s => s.product);

  // If no positive score matches, fallback to general regex match or bestsellers
  if (matches.length === 0 && tokens.length > 0) {
    const regexList = tokens.map(t => new RegExp(t, 'i'));
    matches = products.filter(p => regexList.some(r => r.test(p.name) || r.test(p.description) || r.test(p.category_id?.name)));
  }

  if (matches.length === 0) {
    matches = products.filter(p => p.is_bestseller === 1).slice(0, 6);
  }

  return matches.map(p => ({
    ...p,
    id: p._id,
    category_name: p.category_id?.name,
    category_slug: p.category_id?.slug
  }));
}

exports.getAll = async (req, res) => {
  try {
    const { category, search, bestseller, sort, max_price } = req.query;

    if (search && search.trim()) {
      let products = await smartQuerySearch(search);
      if (category) products = products.filter(p => p.category_slug === category);
      if (bestseller) products = products.filter(p => p.is_bestseller === 1);
      if (max_price) products = products.filter(p => p.base_price <= Number(max_price));

      if (sort === 'price_asc') products.sort((a, b) => a.base_price - b.base_price);
      else if (sort === 'price_desc') products.sort((a, b) => b.base_price - a.base_price);
      else if (sort === 'rating') products.sort((a, b) => b.rating - a.rating);
      else if (sort === 'newest') products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return res.json({ success: true, products, total: products.length });
    }

    let filter = { is_active: 1 };
    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) filter.category_id = cat._id;
    }
    if (bestseller) filter.is_bestseller = 1;
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
    if (!q || !q.trim()) return res.json({ success: true, products: [] });
    const results = await smartQuerySearch(q);
    res.json({ success: true, products: results.slice(0, 10) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.chatQuery = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: 'Question is required' });
    }

    const qLower = question.toLowerCase();

    // 1. FAQ & Info Intent checks
    if (qLower.includes('loyalty') || qLower.includes('point') || qLower.includes('reward')) {
      return res.json({
        success: true,
        answer: '🎁 **Mithai Mandir Loyalty Program**:\n• You earn **5% cashback** in reward points on every completed order.\n• 1 Reward Point = ₹1.\n• You can redeem your points instantly during checkout on your next purchase!',
        products: []
      });
    }

    if (qLower.includes('delivery') || qLower.includes('ship') || qLower.includes('location') || qLower.includes('time')) {
      return res.json({
        success: true,
        answer: '🚚 **Delivery Information**:\n• We deliver fresh bakery items and traditional sweets to Mumbai, Delhi, Bengaluru, Chennai, Hyderabad, Pune, and Kolkata.\n• Standard delivery time is 24-48 hours with temperature-controlled packaging.',
        products: []
      });
    }

    if (qLower.includes('eggless') || qLower.includes('vegetarian') || qLower.includes('vegan') || qLower.includes('sugar free')) {
      const healthyProducts = await smartQuerySearch('biscuits bread dry fruit sweet');
      return res.json({
        success: true,
        answer: '🌱 All sweets and bakery products at Mithai Mandir are **100% Pure Vegetarian & Eggless**! For lower sugar options, check out our wheat biscuits and artisan sourdough breads below.',
        products: healthyProducts.slice(0, 4)
      });
    }

    // 2. Product Search Intent query execution
    const products = await smartQuerySearch(question);

    let answer = `Here are the top matches from our bakery for **"${question}"**:`;
    if (products.length === 0) {
      answer = `We couldn't find exact matches for **"${question}"**, but here are some of our customer favorite bestsellers:`;
    } else {
      const topName = products[0].name;
      const topPrice = products[0].base_price;
      answer = `Found **${products.length}** relevant items! Our top recommendation is **${topName}** starting at ₹${topPrice}. Check them out below:`;
    }

    res.json({
      success: true,
      answer,
      products: products.slice(0, 6)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


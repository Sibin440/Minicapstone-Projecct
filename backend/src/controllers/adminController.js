const bcrypt = require('bcryptjs');
const { getState, getDb } = require('../models/db');
const fs = require('fs');
const path = require('path');

// ─── helpers ────────────────────────────────────────────────────────────────
function saveState(state) {
  const DB_FILE = path.join(__dirname, '../../data/db.json');
  fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf8');
}

function todayStr() { return new Date().toISOString().split('T')[0]; }

function dateN(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
exports.getDashboard = (req, res) => {
  const state = getState();
  const today = todayStr();

  const todayOrders = state.orders.filter(o => o.created_at?.startsWith(today));
  const todaySales = todayOrders.reduce((s, o) => s + (o.total || 0), 0);
  const totalRevenue = state.orders.reduce((s, o) => s + (o.total || 0), 0);
  const totalOrders = state.orders.length;
  const totalCustomers = state.users.filter(u => u.role !== 'admin').length;
  const lowStock = state.products.filter(p => p.is_active === 1 && (p.stock_qty || 0) <= (p.low_stock_threshold || 10));

  // Daily sales last 7 days
  const dailySales = [];
  for (let i = 6; i >= 0; i--) {
    const d = dateN(i);
    const dayOrders = state.orders.filter(o => o.created_at?.startsWith(d));
    const revenue = dayOrders.reduce((s, o) => s + (o.total || 0), 0);
    const label = new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    dailySales.push({ date: d, label, revenue, orders: dayOrders.length });
  }

  // Monthly revenue last 6 months
  const monthlyRevenue = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const ym = d.toISOString().substring(0, 7);
    const mOrders = state.orders.filter(o => o.created_at?.startsWith(ym));
    const revenue = mOrders.reduce((s, o) => s + (o.total || 0), 0);
    const label = d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    monthlyRevenue.push({ month: ym, label, revenue, orders: mOrders.length });
  }

  // Order status breakdown
  const statusBreakdown = {};
  state.orders.forEach(o => { statusBreakdown[o.order_status || 'placed'] = (statusBreakdown[o.order_status || 'placed'] || 0) + 1; });

  // Top 5 best-selling products by order items
  const productSales = {};
  state.order_items.forEach(oi => {
    productSales[oi.product_name] = (productSales[oi.product_name] || 0) + (oi.quantity || 1);
  });
  const topProducts = Object.entries(productSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, qty]) => ({ name, qty }));

  // Recent orders (last 8)
  const recentOrders = state.orders
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 8)
    .map(o => {
      const user = state.users.find(u => u.id === o.user_id);
      return { ...o, customer_name: user?.name || 'Guest', customer_email: user?.email || '' };
    });

  res.json({
    success: true,
    stats: { todaySales, totalRevenue, totalOrders, totalCustomers, lowStockCount: lowStock.length },
    dailySales, monthlyRevenue, statusBreakdown, topProducts, recentOrders,
    lowStockProducts: lowStock.slice(0, 5)
  });
};

// ─── PRODUCTS ────────────────────────────────────────────────────────────────
exports.getAllProducts = (req, res) => {
  const state = getState();
  const products = state.products.map(p => {
    const cat = state.categories.find(c => c.id === p.category_id);
    const weights = state.product_weights.filter(w => w.product_id === p.id);
    return { ...p, category_name: cat?.name || '', category_slug: cat?.slug || '', weights };
  });
  res.json({ success: true, products });
};

exports.createProduct = (req, res) => {
  const state = getState();
  const { category_id, name, description, image_url, base_price, discount_percent, is_bestseller, is_new, is_offer, is_pure_veg, stock_qty, low_stock_threshold, weights } = req.body;
  if (!name || !base_price) return res.status(400).json({ success: false, message: 'Name and price are required' });

  const id = Date.now();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const product = {
    id, category_id: Number(category_id), name, slug, description: description || '',
    image_url: image_url || '', base_price: Number(base_price),
    discount_percent: Number(discount_percent) || 0,
    is_bestseller: is_bestseller ? 1 : 0, is_new: is_new ? 1 : 0,
    is_offer: is_offer ? 1 : 0, is_pure_veg: is_pure_veg ? 1 : 0,
    rating: 0, rating_count: 0, is_active: 1,
    stock_qty: Number(stock_qty) || 30, low_stock_threshold: Number(low_stock_threshold) || 10,
    created_at: new Date().toISOString()
  };
  state.products.push(product);

  if (Array.isArray(weights) && weights.length > 0) {
    weights.forEach((w, i) => {
      state.product_weights.push({ id: id + i + 1, product_id: id, weight: w.weight, price: Number(w.price) });
    });
  } else {
    state.product_weights.push({ id: id + 1, product_id: id, weight: '500 gms', price: Number(base_price) });
  }

  saveState(state);
  const cat = state.categories.find(c => c.id === product.category_id);
  res.json({ success: true, product: { ...product, category_name: cat?.name, weights: state.product_weights.filter(w => w.product_id === id) } });
};

exports.updateProduct = (req, res) => {
  const state = getState();
  const pid = Number(req.params.id);
  const p = state.products.find(x => x.id === pid);
  if (!p) return res.status(404).json({ success: false, message: 'Product not found' });

  const { name, description, image_url, base_price, discount_percent, is_bestseller, is_new, is_offer, is_pure_veg, stock_qty, low_stock_threshold, category_id, weights, is_active } = req.body;

  if (name !== undefined) p.name = name;
  if (description !== undefined) p.description = description;
  if (image_url !== undefined) p.image_url = image_url;
  if (base_price !== undefined) p.base_price = Number(base_price);
  if (discount_percent !== undefined) p.discount_percent = Number(discount_percent);
  if (is_bestseller !== undefined) p.is_bestseller = is_bestseller ? 1 : 0;
  if (is_new !== undefined) p.is_new = is_new ? 1 : 0;
  if (is_offer !== undefined) p.is_offer = is_offer ? 1 : 0;
  if (is_pure_veg !== undefined) p.is_pure_veg = is_pure_veg ? 1 : 0;
  if (stock_qty !== undefined) p.stock_qty = Number(stock_qty);
  if (low_stock_threshold !== undefined) p.low_stock_threshold = Number(low_stock_threshold);
  if (category_id !== undefined) p.category_id = Number(category_id);
  if (is_active !== undefined) p.is_active = is_active ? 1 : 0;

  if (Array.isArray(weights)) {
    state.product_weights = state.product_weights.filter(w => w.product_id !== pid);
    weights.forEach((w, i) => {
      state.product_weights.push({ id: Date.now() + i, product_id: pid, weight: w.weight, price: Number(w.price) });
    });
  }

  saveState(state);
  const cat = state.categories.find(c => c.id === p.category_id);
  res.json({ success: true, product: { ...p, category_name: cat?.name, weights: state.product_weights.filter(w => w.product_id === pid) } });
};

exports.deleteProduct = (req, res) => {
  const state = getState();
  const pid = Number(req.params.id);
  const idx = state.products.findIndex(x => x.id === pid);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Product not found' });
  state.products.splice(idx, 1);
  state.product_weights = state.product_weights.filter(w => w.product_id !== pid);
  saveState(state);
  res.json({ success: true, message: 'Product deleted' });
};

// ─── ORDERS ──────────────────────────────────────────────────────────────────
exports.getAllOrders = (req, res) => {
  const state = getState();
  const { status, page = 1, limit = 20 } = req.query;
  let orders = state.orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  if (status) orders = orders.filter(o => o.order_status === status);

  const total = orders.length;
  const offset = (Number(page) - 1) * Number(limit);
  orders = orders.slice(offset, offset + Number(limit));

  const result = orders.map(o => {
    const user = state.users.find(u => u.id === o.user_id);
    const items = state.order_items.filter(oi => oi.order_id === o.id);
    return { ...o, customer_name: user?.name || 'Guest', customer_email: user?.email || '', items };
  });

  res.json({ success: true, orders: result, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
};

exports.updateOrderStatus = (req, res) => {
  const state = getState();
  const oid = Number(req.params.id);
  const { status } = req.body;

  const ORDER_STATUSES = ['placed', 'confirmed', 'preparing', 'packed', 'out_for_delivery', 'delivered', 'cancelled'];
  if (!ORDER_STATUSES.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });

  const order = state.orders.find(o => o.id === oid);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  const prevStatus = order.order_status;
  order.order_status = status;

  // Award loyalty points when delivered
  if (status === 'delivered' && prevStatus !== 'delivered') {
    const rate = (state.loyalty_config?.earn_rate_per_100) || 5;
    const pts = Math.floor((order.total || 0) / 100) * rate;
    if (pts > 0) {
      const existing = state.loyalty_points.find(lp => lp.user_id === order.user_id);
      if (existing) {
        existing.balance = (existing.balance || 0) + pts;
        existing.transactions = existing.transactions || [];
        existing.transactions.push({ type: 'earn', pts, reason: `Order #${oid} delivered`, created_at: new Date().toISOString() });
      } else {
        state.loyalty_points.push({
          user_id: order.user_id, balance: pts,
          transactions: [{ type: 'earn', pts, reason: `Order #${oid} delivered`, created_at: new Date().toISOString() }]
        });
      }
    }
  }

  saveState(state);
  res.json({ success: true, order });
};

// ─── CUSTOMERS ───────────────────────────────────────────────────────────────
exports.getAllCustomers = (req, res) => {
  const state = getState();
  const customers = state.users.filter(u => u.role !== 'admin').map(u => {
    const orders = state.orders.filter(o => o.user_id === u.id);
    const totalSpend = orders.reduce((s, o) => s + (o.total || 0), 0);
    const loyalty = state.loyalty_points.find(lp => lp.user_id === u.id);
    const lastOrder = orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
    return {
      id: u.id, name: u.name, email: u.email, phone: u.phone, created_at: u.created_at,
      total_orders: orders.length, total_spend: totalSpend,
      loyalty_balance: loyalty?.balance || 0,
      last_order_date: lastOrder?.created_at || null
    };
  });
  res.json({ success: true, customers });
};

exports.getCustomerDetails = (req, res) => {
  const state = getState();
  const uid = Number(req.params.id);
  const user = state.users.find(u => u.id === uid);
  if (!user) return res.status(404).json({ success: false, message: 'Customer not found' });

  const orders = state.orders
    .filter(o => o.user_id === uid)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map(o => ({ ...o, items: state.order_items.filter(oi => oi.order_id === o.id) }));

  const totalSpend = orders.reduce((s, o) => s + (o.total || 0), 0);
  const loyalty = state.loyalty_points.find(lp => lp.user_id === uid);

  res.json({
    success: true,
    customer: { id: user.id, name: user.name, email: user.email, phone: user.phone, created_at: user.created_at },
    orders, totalSpend, loyaltyBalance: loyalty?.balance || 0, loyaltyTransactions: loyalty?.transactions || []
  });
};

// ─── INVENTORY ───────────────────────────────────────────────────────────────
exports.getInventory = (req, res) => {
  const state = getState();
  const inventory = state.products.filter(p => p.is_active === 1).map(p => {
    const cat = state.categories.find(c => c.id === p.category_id);
    return {
      id: p.id, name: p.name, image_url: p.image_url,
      category_name: cat?.name || '',
      stock_qty: p.stock_qty || 0,
      low_stock_threshold: p.low_stock_threshold || 10,
      is_low: (p.stock_qty || 0) <= (p.low_stock_threshold || 10)
    };
  });
  res.json({ success: true, inventory });
};

exports.updateStock = (req, res) => {
  const state = getState();
  const pid = Number(req.params.id);
  const { stock_qty, low_stock_threshold } = req.body;
  const p = state.products.find(x => x.id === pid);
  if (!p) return res.status(404).json({ success: false, message: 'Product not found' });
  if (stock_qty !== undefined) p.stock_qty = Number(stock_qty);
  if (low_stock_threshold !== undefined) p.low_stock_threshold = Number(low_stock_threshold);
  saveState(state);
  res.json({ success: true, product: p });
};

// ─── LOYALTY ─────────────────────────────────────────────────────────────────
exports.getLoyaltyConfig = (req, res) => {
  const state = getState();
  res.json({ success: true, config: state.loyalty_config || { earn_rate_per_100: 5 } });
};

exports.updateLoyaltyConfig = (req, res) => {
  const state = getState();
  const { earn_rate_per_100 } = req.body;
  if (!state.loyalty_config) state.loyalty_config = {};
  state.loyalty_config.earn_rate_per_100 = Number(earn_rate_per_100) || 5;
  saveState(state);
  res.json({ success: true, config: state.loyalty_config });
};

exports.getLoyaltyLedger = (req, res) => {
  const state = getState();
  const ledger = state.loyalty_points.map(lp => {
    const user = state.users.find(u => u.id === lp.user_id);
    return { user_id: lp.user_id, name: user?.name, email: user?.email, balance: lp.balance || 0, transactions: lp.transactions || [] };
  });
  res.json({ success: true, ledger });
};

exports.getMyLoyalty = (req, res) => {
  const state = getState();
  const lp = state.loyalty_points.find(x => x.user_id === req.user.id);
  res.json({ success: true, balance: lp?.balance || 0, transactions: lp?.transactions || [] });
};

// ─── ANALYTICS ───────────────────────────────────────────────────────────────
exports.getAnalytics = (req, res) => {
  const state = getState();
  const { range = '7days' } = req.query;

  const now = new Date();
  let startDate;
  if (range === 'today') startDate = new Date(now.toISOString().split('T')[0]);
  else if (range === '7days') { startDate = new Date(now); startDate.setDate(startDate.getDate() - 6); }
  else if (range === '30days') { startDate = new Date(now); startDate.setDate(startDate.getDate() - 29); }
  else if (range === 'month') startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  else startDate = new Date(0);

  const filteredOrders = state.orders.filter(o => new Date(o.created_at) >= startDate);

  const totalRevenue = filteredOrders.reduce((s, o) => s + (o.total || 0), 0);
  const totalOrders = filteredOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Revenue by day
  const byDay = {};
  filteredOrders.forEach(o => {
    const d = o.created_at?.split('T')[0];
    if (!byDay[d]) byDay[d] = { revenue: 0, orders: 0 };
    byDay[d].revenue += o.total || 0;
    byDay[d].orders += 1;
  });
  const revenueByDay = Object.entries(byDay).sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, v]) => ({ date, label: new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), ...v }));

  // Best categories
  const catRevenue = {};
  filteredOrders.forEach(o => {
    const items = state.order_items.filter(oi => oi.order_id === o.id);
    items.forEach(oi => {
      const prod = state.products.find(p => p.id === oi.product_id);
      const cat = prod ? state.categories.find(c => c.id === prod.category_id) : null;
      const catName = cat?.name || 'Other';
      catRevenue[catName] = (catRevenue[catName] || 0) + (oi.total_price || 0);
    });
  });
  const bestCategories = Object.entries(catRevenue).sort((a, b) => b[1] - a[1]).map(([name, revenue]) => ({ name, revenue }));

  // Best products
  const prodSales = {};
  state.order_items.forEach(oi => {
    if (filteredOrders.find(o => o.id === oi.order_id)) {
      prodSales[oi.product_name] = (prodSales[oi.product_name] || 0) + (oi.quantity || 1);
    }
  });
  const bestProducts = Object.entries(prodSales).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, qty]) => ({ name, qty }));

  res.json({ success: true, totalRevenue, totalOrders, avgOrderValue, revenueByDay, bestCategories, bestProducts });
};

// ─── SALES PREDICTION ────────────────────────────────────────────────────────
exports.getSalesPrediction = (req, res) => {
  const state = getState();
  const orders = state.orders;

  if (orders.length === 0) {
    return res.json({ success: true, prediction: { revenue: 0, orders: 0, topProducts: [], inventory: [] }, message: 'Not enough data for prediction' });
  }

  // Use last 30 days of data
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 30);
  const recent = orders.filter(o => new Date(o.created_at) >= cutoff);

  // Day-of-week weights (0=Sun, 1=Mon ... 6=Sat)
  const dow = new Date().getDay();
  const tomorrow = (dow + 1) % 7;
  const dayOrders = {};
  recent.forEach(o => {
    const d = new Date(o.created_at).getDay();
    if (!dayOrders[d]) dayOrders[d] = [];
    dayOrders[d].push(o.total || 0);
  });

  const tomorrowHistory = dayOrders[tomorrow] || [];
  const overallAvgRevenue = recent.length > 0 ? recent.reduce((s, o) => s + (o.total || 0), 0) / 30 : 0;
  const tomorrowAvgRevenue = tomorrowHistory.length > 0 ? tomorrowHistory.reduce((s, v) => s + v, 0) / tomorrowHistory.length : overallAvgRevenue;

  const predictedRevenue = Math.round(tomorrowAvgRevenue * 1.05); // +5% growth factor
  const predictedOrders = Math.max(1, Math.round(predictedRevenue / (recent.length > 0 ? recent.reduce((s, o) => s + (o.total || 0), 0) / recent.length : 300)));

  // Top products from recent orders
  const prodSales = {};
  state.order_items.forEach(oi => {
    if (recent.find(o => o.id === oi.order_id)) {
      if (!prodSales[oi.product_name]) prodSales[oi.product_name] = { qty: 0, product_id: oi.product_id };
      prodSales[oi.product_name].qty += (oi.quantity || 1);
    }
  });
  const topProducts = Object.entries(prodSales).sort((a, b) => b[1].qty - a[1].qty).slice(0, 5).map(([name, v]) => ({ name, qty: v.qty }));

  // Recommended inventory
  const inventory = topProducts.map(tp => {
    const dailyAvg = tp.qty / 30;
    return { product: tp.name, recommended_qty: Math.ceil(dailyAvg * 1.5) };
  });

  const tomorrowDate = new Date(); tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  res.json({
    success: true,
    prediction: {
      date: tomorrowDate.toISOString().split('T')[0],
      day_name: dayNames[tomorrow],
      revenue: predictedRevenue,
      orders: predictedOrders,
      confidence: tomorrowHistory.length > 0 ? 'High' : 'Moderate',
      topProducts,
      inventory,
      insights: [
        `Based on ${recent.length} orders in the last 30 days`,
        tomorrowHistory.length > 0 ? `${dayNames[tomorrow]}s historically generate ₹${Math.round(tomorrowAvgRevenue)} in revenue` : 'Insufficient day-specific data, using 30-day average',
        `Average order value: ₹${recent.length > 0 ? Math.round(recent.reduce((s, o) => s + (o.total || 0), 0) / recent.length) : 0}`
      ]
    }
  });
};

// ─── CATEGORIES ──────────────────────────────────────────────────────────────
exports.getCategories = (req, res) => {
  const state = getState();
  res.json({ success: true, categories: state.categories.filter(c => c.is_active === 1) });
};

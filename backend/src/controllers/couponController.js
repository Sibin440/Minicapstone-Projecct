const { getDb } = require('../models/db');

exports.applyCoupon = (req, res) => {
  const db = getDb();
  const { code, cart_total } = req.body;
  if (!code || !cart_total) return res.status(400).json({ success: false, message: 'Coupon code and cart total are required' });
  const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND is_active = 1').get(code.toUpperCase());
  if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code' });
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) return res.status(400).json({ success: false, message: 'Coupon has expired' });
  if (coupon.used_count >= coupon.usage_limit) return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
  if (parseFloat(cart_total) < coupon.min_order_amount) return res.status(400).json({ success: false, message: `Minimum order amount ₹${coupon.min_order_amount} required` });
  let discount = 0;
  if (coupon.discount_type === 'percent') {
    discount = (parseFloat(cart_total) * coupon.discount_value) / 100;
    if (coupon.max_discount) discount = Math.min(discount, coupon.max_discount);
  } else {
    discount = Math.min(coupon.discount_value, parseFloat(cart_total));
  }
  res.json({ success: true, coupon: { code: coupon.code, description: coupon.description, discount_type: coupon.discount_type, discount_value: coupon.discount_value, discount_amount: Math.round(discount * 100) / 100 } });
};

exports.getAllCoupons = (req, res) => {
  const db = getDb();
  const coupons = db.prepare('SELECT code, description, discount_type, discount_value, min_order_amount, max_discount FROM coupons WHERE is_active = 1').all();
  res.json({ success: true, coupons });
};

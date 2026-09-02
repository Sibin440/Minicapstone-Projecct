const { getDb } = require('../models/db');

function getOrCreateCart(db, userId) {
  let cart = db.prepare('SELECT * FROM cart WHERE user_id = ?').get(userId);
  if (!cart) {
    const r = db.prepare('INSERT INTO cart (user_id) VALUES (?)').run(userId);
    cart = db.prepare('SELECT * FROM cart WHERE id = ?').get(r.lastInsertRowid);
  }
  return cart;
}

exports.createOrder = (req, res) => {
  const db = getDb();
  const { address_id, delivery_slot, payment_method = 'cod', notes, coupon_code } = req.body;
  const cart = getOrCreateCart(db, req.user.id);
  const items = db.prepare(`
    SELECT ci.*, pw.price as unit_price, pw.weight, p.name as product_name
    FROM cart_items ci
    JOIN product_weights pw ON ci.weight_id = pw.id
    JOIN products p ON ci.product_id = p.id
    WHERE ci.cart_id = ?
  `).all(cart.id);
  if (items.length === 0) return res.status(400).json({ success: false, message: 'Cart is empty' });

  const subtotal = items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  let discount_amount = 0;
  if (coupon_code) {
    const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND is_active = 1').get(coupon_code);
    if (coupon && subtotal >= coupon.min_order_amount) {
      if (coupon.discount_type === 'percent') {
        discount_amount = Math.min((subtotal * coupon.discount_value) / 100, coupon.max_discount || 99999);
      } else {
        discount_amount = Math.min(coupon.discount_value, coupon.max_discount || 99999);
      }
    }
  }
  const delivery_charge = subtotal >= 500 ? 0 : 50;
  const total = subtotal - discount_amount + delivery_charge;

  const placeOrder = db.transaction(() => {
    const orderResult = db.prepare(`
      INSERT INTO orders (user_id, address_id, coupon_code, subtotal, discount_amount, delivery_charge, total, payment_method, delivery_slot, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(req.user.id, address_id || null, coupon_code || null, subtotal, discount_amount, delivery_charge, total, payment_method, delivery_slot || null, notes || null);
    const orderId = orderResult.lastInsertRowid;
    for (const item of items) {
      db.prepare(`INSERT INTO order_items (order_id, product_id, product_name, weight, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?, ?, ?)`).
        run(orderId, item.product_id, item.product_name, item.weight, item.quantity, item.unit_price, item.unit_price * item.quantity);
    }
    db.prepare('DELETE FROM cart_items WHERE cart_id = ?').run(cart.id);
    return orderId;
  });

  const orderId = placeOrder();
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  order.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);
  res.status(201).json({ success: true, message: 'Order placed successfully!', order });
};

exports.getOrders = (req, res) => {
  const db = getDb();
  const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  orders.forEach(order => {
    order.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  });
  res.json({ success: true, orders });
};

exports.getOrderById = (req, res) => {
  const db = getDb();
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  order.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  if (order.address_id) {
    order.address = db.prepare('SELECT * FROM addresses WHERE id = ?').get(order.address_id);
  }
  res.json({ success: true, order });
};

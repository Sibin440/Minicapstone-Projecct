const { getDb } = require('../models/db');

function getOrCreateCart(db, userId) {
  let cart = db.prepare('SELECT * FROM cart WHERE user_id = ?').get(userId);
  if (!cart) {
    const r = db.prepare('INSERT INTO cart (user_id) VALUES (?)').run(userId);
    cart = db.prepare('SELECT * FROM cart WHERE id = ?').get(r.lastInsertRowid);
  }
  return cart;
}

function getCartItems(db, cartId) {
  return db.prepare(`
    SELECT ci.id, ci.quantity, ci.product_id, ci.weight_id,
      p.name, p.image_url, p.is_pure_veg, p.discount_percent,
      pw.weight, pw.price as unit_price,
      (pw.price * ci.quantity) as total_price
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    JOIN product_weights pw ON ci.weight_id = pw.id
    WHERE ci.cart_id = ?
  `).all(cartId);
}

exports.getCart = (req, res) => {
  const db = getDb();
  const cart = getOrCreateCart(db, req.user.id);
  const items = getCartItems(db, cart.id);
  const subtotal = items.reduce((sum, i) => sum + i.total_price, 0);
  res.json({ success: true, cart: { id: cart.id, items, subtotal, item_count: items.reduce((s, i) => s + i.quantity, 0) } });
};

exports.addToCart = (req, res) => {
  const db = getDb();
  const { product_id, weight_id, quantity = 1 } = req.body;
  if (!product_id || !weight_id) return res.status(400).json({ success: false, message: 'product_id and weight_id required' });
  const product = db.prepare('SELECT id FROM products WHERE id = ? AND is_active = 1').get(product_id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  const weight = db.prepare('SELECT id FROM product_weights WHERE id = ? AND product_id = ?').get(weight_id, product_id);
  if (!weight) return res.status(400).json({ success: false, message: 'Invalid weight option' });
  const cart = getOrCreateCart(db, req.user.id);
  const existing = db.prepare('SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ? AND weight_id = ?').get(cart.id, product_id, weight_id);
  if (existing) {
    db.prepare('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?').run(quantity, existing.id);
  } else {
    db.prepare('INSERT INTO cart_items (cart_id, product_id, weight_id, quantity) VALUES (?, ?, ?, ?)').run(cart.id, product_id, weight_id, quantity);
  }
  const items = getCartItems(db, cart.id);
  const subtotal = items.reduce((sum, i) => sum + i.total_price, 0);
  res.json({ success: true, message: 'Added to cart', cart: { id: cart.id, items, subtotal, item_count: items.reduce((s, i) => s + i.quantity, 0) } });
};

exports.updateCartItem = (req, res) => {
  const db = getDb();
  const { quantity } = req.body;
  const cart = getOrCreateCart(db, req.user.id);
  const item = db.prepare('SELECT * FROM cart_items WHERE id = ? AND cart_id = ?').get(req.params.itemId, cart.id);
  if (!item) return res.status(404).json({ success: false, message: 'Cart item not found' });
  if (quantity <= 0) {
    db.prepare('DELETE FROM cart_items WHERE id = ?').run(item.id);
  } else {
    db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(quantity, item.id);
  }
  const items = getCartItems(db, cart.id);
  const subtotal = items.reduce((sum, i) => sum + i.total_price, 0);
  res.json({ success: true, cart: { id: cart.id, items, subtotal, item_count: items.reduce((s, i) => s + i.quantity, 0) } });
};

exports.removeCartItem = (req, res) => {
  const db = getDb();
  const cart = getOrCreateCart(db, req.user.id);
  const item = db.prepare('SELECT * FROM cart_items WHERE id = ? AND cart_id = ?').get(req.params.itemId, cart.id);
  if (!item) return res.status(404).json({ success: false, message: 'Cart item not found' });
  db.prepare('DELETE FROM cart_items WHERE id = ?').run(item.id);
  const items = getCartItems(db, cart.id);
  const subtotal = items.reduce((sum, i) => sum + i.total_price, 0);
  res.json({ success: true, cart: { id: cart.id, items, subtotal, item_count: items.reduce((s, i) => s + i.quantity, 0) } });
};

exports.clearCart = (req, res) => {
  const db = getDb();
  const cart = getOrCreateCart(db, req.user.id);
  db.prepare('DELETE FROM cart_items WHERE cart_id = ?').run(cart.id);
  res.json({ success: true, message: 'Cart cleared' });
};

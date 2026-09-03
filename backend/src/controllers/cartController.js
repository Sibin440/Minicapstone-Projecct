const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user_id: req.user.id });
    if (!cart) cart = await Cart.create({ user_id: req.user.id, items: [] });
    const subtotal = cart.items.reduce((s, i) => s + i.total_price, 0);
    res.json({ success: true, cart: { id: cart._id, items: cart.items.map(i => ({ ...i.toObject(), id: i._id })), subtotal, item_count: cart.items.reduce((s, i) => s + i.quantity, 0) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { product_id, weight_id, quantity = 1 } = req.body;
    const product = await Product.findById(product_id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const weightObj = product.weights.id(weight_id) || product.weights[0];
    if (!weightObj) return res.status(400).json({ success: false, message: 'Invalid weight' });

    let cart = await Cart.findOne({ user_id: req.user.id });
    if (!cart) cart = await Cart.create({ user_id: req.user.id, items: [] });

    const existingIdx = cart.items.findIndex(i => i.product_id.toString() === product_id && i.weight_id === weight_id);
    if (existingIdx > -1) {
      cart.items[existingIdx].quantity += quantity;
      cart.items[existingIdx].total_price = cart.items[existingIdx].unit_price * cart.items[existingIdx].quantity;
    } else {
      cart.items.push({ product_id, weight_id, name: product.name, image_url: product.image_url, weight: weightObj.weight, unit_price: weightObj.price, quantity, total_price: weightObj.price * quantity });
    }
    await cart.save();
    const subtotal = cart.items.reduce((s, i) => s + i.total_price, 0);
    res.json({ success: true, cart: { id: cart._id, items: cart.items.map(i => ({ ...i.toObject(), id: i._id })), subtotal, item_count: cart.items.reduce((s, i) => s + i.quantity, 0) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user_id: req.user.id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Cart item not found' });
    if (quantity <= 0) {
      item.deleteOne();
    } else {
      item.quantity = quantity;
      item.total_price = item.unit_price * quantity;
    }
    await cart.save();
    const subtotal = cart.items.reduce((s, i) => s + i.total_price, 0);
    res.json({ success: true, cart: { id: cart._id, items: cart.items.map(i => ({ ...i.toObject(), id: i._id })), subtotal, item_count: cart.items.reduce((s, i) => s + i.quantity, 0) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.removeCartItem = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user_id: req.user.id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Cart item not found' });
    item.deleteOne();
    await cart.save();
    const subtotal = cart.items.reduce((s, i) => s + i.total_price, 0);
    res.json({ success: true, cart: { id: cart._id, items: cart.items.map(i => ({ ...i.toObject(), id: i._id })), subtotal, item_count: cart.items.reduce((s, i) => s + i.quantity, 0) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user_id: req.user.id }, { items: [] });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

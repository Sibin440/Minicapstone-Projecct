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

    let weightObj = null;
    if (weight_id && product.weights && product.weights.length > 0) {
      try {
        weightObj = product.weights.id(weight_id) || product.weights.find(w => String(w._id) === String(weight_id) || w.weight === weight_id);
      } catch (_) {}
    }
    if (!weightObj && product.weights && product.weights.length > 0) {
      weightObj = product.weights[0];
    }

    const weightIdStr = weightObj ? String(weightObj._id || weightObj.weight || '') : '';
    const weightName = weightObj ? weightObj.weight : 'Standard';
    const unitPrice = weightObj ? weightObj.price : product.base_price;

    let cart = await Cart.findOne({ user_id: req.user.id });
    if (!cart) cart = await Cart.create({ user_id: req.user.id, items: [] });

    // Match existing item by product_id AND weight
    const existingIdx = cart.items.findIndex(i => {
      const matchProd = String(i.product_id) === String(product_id);
      const matchWeight = String(i.weight_id || '') === weightIdStr || i.weight === weightName;
      return matchProd && matchWeight;
    });

    if (existingIdx > -1) {
      cart.items[existingIdx].quantity += Number(quantity);
      cart.items[existingIdx].total_price = cart.items[existingIdx].unit_price * cart.items[existingIdx].quantity;
    } else {
      cart.items.push({
        product_id,
        weight_id: weightIdStr,
        name: product.name,
        image_url: product.image_url,
        weight: weightName,
        unit_price: unitPrice,
        quantity: Number(quantity),
        total_price: unitPrice * Number(quantity)
      });
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

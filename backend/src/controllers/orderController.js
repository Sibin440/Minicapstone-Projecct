const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Address = require('../models/Address');
const Loyalty = require('../models/Loyalty');

exports.placeOrder = async (req, res) => {
  try {
    const { address_id, payment_method = 'cod', delivery_slot = '', notes = '', coupon_code = '' } = req.body;
    const cart = await Cart.findOne({ user_id: req.user.id });
    if (!cart || cart.items.length === 0) return res.status(400).json({ success: false, message: 'Cart is empty' });

    let address = {};
    if (address_id) {
      const addr = await Address.findById(address_id);
      if (addr) address = addr.toObject();
    }

    const subtotal = cart.items.reduce((s, i) => s + i.total_price, 0);
    const delivery_charge = subtotal >= 500 ? 0 : 50;
    const total = subtotal + delivery_charge;

    const order = await Order.create({
      user_id: req.user.id,
      address,
      items: cart.items.map(i => ({ product_id: i.product_id, product_name: i.name, weight: i.weight, quantity: i.quantity, unit_price: i.unit_price, total_price: i.total_price })),
      coupon_code, subtotal, discount_amount: 0, delivery_charge, total,
      payment_method, delivery_slot, notes,
    });

    // Clear cart
    await Cart.findOneAndUpdate({ user_id: req.user.id }, { items: [] });

    res.status(201).json({ success: true, order: { ...order.toObject(), id: order._id } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user.id }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, orders: orders.map(o => ({ ...o, id: o._id })) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user_id: req.user.id }).lean();
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order: { ...order, id: order._id } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

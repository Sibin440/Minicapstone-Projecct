const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Address = require('../models/Address');
const Loyalty = require('../models/Loyalty');
const User = require('../models/User');

function buildWhatsAppInfo(order, user) {
  const phone = user?.phone || order.address?.phone || '';
  const cleanPhone = phone.replace(/[^0-9]/g, '');

  const orderNum = order._id ? order._id.toString().slice(-6).toUpperCase() : 'ONLINE';
  const customerName = user?.name || order.address?.name || 'Valued Customer';
  const expectedPoints = Math.floor((order.total || 0) / 100) * 5;
  const otpCode = order.delivery_otp || 'N/A';

  const text = `🍬 *SVS SWEETS & BAKERY*
Hi ${customerName}! Thank you for placing your online order with us! 🎉

📦 *Order ID:* #${orderNum}
💰 *Total Paid:* ₹${order.total} (${(order.payment_method || 'COD').toUpperCase()})
🔐 *Delivery OTP:* ${otpCode} (Give this 4-digit OTP to delivery executive)
⭐ *Reward Points:* You will earn +${expectedPoints} points on order delivery!

Thank you for shopping with SVS Sweets & Bakery! 🍬`;

  const encodedText = encodeURIComponent(text);
  const whatsappUrl = cleanPhone
    ? `https://api.whatsapp.com/send?phone=91${cleanPhone.length === 10 ? cleanPhone : cleanPhone.slice(-10)}&text=${encodedText}`
    : `https://api.whatsapp.com/send?text=${encodedText}`;

  return { whatsapp_text: text, whatsapp_url: whatsappUrl };
}

// Minimum order amount for online delivery
const MIN_DELIVERY_AMOUNT = 400;

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

    // Group and deduplicate items by product_id and weight
    const groupedItemsMap = new Map();
    for (const item of cart.items) {
      const key = `${String(item.product_id)}_${item.weight || ''}`;
      if (groupedItemsMap.has(key)) {
        const existing = groupedItemsMap.get(key);
        existing.quantity += item.quantity;
        existing.total_price += item.total_price;
      } else {
        groupedItemsMap.set(key, {
          product_id: item.product_id,
          product_name: item.name || item.product_name,
          weight: item.weight || '1 unit',
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
        });
      }
    }
    const orderItems = Array.from(groupedItemsMap.values());

    const subtotal = orderItems.reduce((s, i) => s + i.total_price, 0);

    // ─── Feature 1: Minimum ₹400 for online delivery ───
    if (subtotal < MIN_DELIVERY_AMOUNT) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount for online delivery is ₹${MIN_DELIVERY_AMOUNT}. Please add more items (₹${MIN_DELIVERY_AMOUNT - subtotal} more needed).`,
        min_amount: MIN_DELIVERY_AMOUNT,
        current_subtotal: subtotal,
      });
    }


    // ─── Feature 2: Repeat Customer Offers ───
    // Check how many past orders this user has placed
    const pastOrderCount = await Order.countDocuments({ user_id: req.user.id, order_status: { $ne: 'cancelled' } });

    // Loyalty discount tiers based on order history
    let discount_amount = 0;
    let applied_coupon = coupon_code || '';
    let loyalty_offer_msg = '';

    if (coupon_code) {
      // If user provided their own coupon, apply it
      const manualCoupons = {
        'SWEET10': { discount_type: 'percent', value: 10 },
        'SWEET20': { discount_type: 'percent', value: 20 },
        'FLAT50':  { discount_type: 'flat',    value: 50 },
      };
      const manualCoupon = manualCoupons[String(coupon_code).toUpperCase()];
      if (manualCoupon) {
        discount_amount = manualCoupon.discount_type === 'percent'
          ? Math.round((subtotal * manualCoupon.value) / 100)
          : manualCoupon.value;
      }
    } else if (pastOrderCount >= 10) {
      // VIP customer: 15% off
      discount_amount = Math.round((subtotal * 15) / 100);
      applied_coupon = 'LOYAL15';
      loyalty_offer_msg = '🏆 VIP Customer: 15% loyalty discount applied!';
    } else if (pastOrderCount >= 5) {
      // Regular repeat customer: 10% off
      discount_amount = Math.round((subtotal * 10) / 100);
      applied_coupon = 'LOYAL10';
      loyalty_offer_msg = '⭐ Loyal Customer: 10% loyalty discount applied!';
    } else if (pastOrderCount >= 3) {
      // First repeat milestone: 5% off
      discount_amount = Math.round((subtotal * 5) / 100);
      applied_coupon = 'LOYAL5';
      loyalty_offer_msg = '🎁 Repeat Customer: 5% loyalty discount applied!';
    }

    const discountedSubtotal = subtotal - discount_amount;
    const delivery_charge = discountedSubtotal >= 500 ? 0 : 50;
    const total = discountedSubtotal + delivery_charge;
    const points_earned = Math.floor(total / 100) * 5;

    // Generate random 4-digit Delivery OTP
    const delivery_otp = Math.floor(1000 + Math.random() * 9000).toString();

    const order = await Order.create({
      user_id: req.user.id,
      address,
      items: orderItems,
      coupon_code: applied_coupon,
      subtotal,
      discount_amount,
      delivery_charge,
      total,
      payment_method,
      delivery_slot,
      notes,
      order_type: 'online',
      points_earned,
      delivery_otp,
    });

    // Clear cart
    await Cart.findOneAndUpdate({ user_id: req.user.id }, { items: [] });

    const user = await User.findById(req.user.id).lean();
    const wsInfo = buildWhatsAppInfo(order, user);

    res.status(201).json({
      success: true,
      loyalty_offer_msg,
      order: {
        ...order.toObject(),
        id: order._id,
        ...wsInfo,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getLoyaltyOffer = async (req, res) => {
  try {
    const pastOrderCount = await Order.countDocuments({ user_id: req.user.id, order_status: { $ne: 'cancelled' } });

    let offer = null;
    if (pastOrderCount >= 10) {
      offer = { coupon: 'LOYAL15', discount: 15, type: 'percent', label: '🏆 VIP Customer Offer', description: '15% off on your order!', orders_placed: pastOrderCount };
    } else if (pastOrderCount >= 5) {
      offer = { coupon: 'LOYAL10', discount: 10, type: 'percent', label: '⭐ Loyal Customer Offer', description: '10% off on your order!', orders_placed: pastOrderCount };
    } else if (pastOrderCount >= 3) {
      offer = { coupon: 'LOYAL5', discount: 5, type: 'percent', label: '🎁 Repeat Customer Offer', description: '5% off on your order!', orders_placed: pastOrderCount };
    } else {
      const ordersNeeded = 3 - pastOrderCount;
      offer = {
        coupon: null,
        discount: 0,
        type: null,
        label: null,
        description: `Place ${ordersNeeded} more order${ordersNeeded > 1 ? 's' : ''} to unlock your first loyalty discount!`,
        orders_placed: pastOrderCount,
        next_milestone: 3,
      };
    }

    res.json({ success: true, offer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();
    const orders = await Order.find({ user_id: req.user.id }).sort({ createdAt: -1 }).lean();
    const withWs = orders.map(o => {
      const wsInfo = buildWhatsAppInfo(o, user);
      return { ...o, id: o._id, ...wsInfo };
    });
    res.json({ success: true, orders: withWs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();
    const order = await Order.findOne({ _id: req.params.id, user_id: req.user.id }).lean();
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    const wsInfo = buildWhatsAppInfo(order, user);
    res.json({ success: true, order: { ...order, id: order._id, ...wsInfo } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

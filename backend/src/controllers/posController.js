const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Loyalty = require('../models/Loyalty');

// 1. Lookup Customer by phone or name
exports.lookupCustomer = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json({ success: true, customers: [] });

    const searchRegex = new RegExp(query.trim(), 'i');
    const users = await User.find({
      role: 'customer',
      $or: [{ phone: searchRegex }, { name: searchRegex }, { email: searchRegex }],
    }).select('-password').limit(10).lean();

    const withLoyalty = await Promise.all(users.map(async (u) => {
      const loyalty = await Loyalty.findOne({ user_id: u._id }).lean();
      return {
        id: u._id,
        _id: u._id,
        name: u.name,
        phone: u.phone || 'N/A',
        email: u.email,
        points: loyalty ? loyalty.balance : 0,
      };
    }));

    res.json({ success: true, customers: withLoyalty });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 2. Quick Register Customer for POS
exports.quickRegister = async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and phone number are required' });
    }

    const cleanPhone = phone.trim();
    let existing = await User.findOne({ phone: cleanPhone });
    if (existing) {
      const loyalty = await Loyalty.findOne({ user_id: existing._id }).lean();
      return res.json({
        success: true,
        customer: {
          id: existing._id,
          _id: existing._id,
          name: existing.name,
          phone: existing.phone,
          email: existing.email,
          points: loyalty ? loyalty.balance : 0,
        },
        message: 'Existing customer loaded',
      });
    }

    const userEmail = email ? email.trim().toLowerCase() : `cust_${cleanPhone}@mandir.shop`;
    const user = await User.create({
      name: name.trim(),
      phone: cleanPhone,
      email: userEmail,
      password: 'pos_walkin_pass',
      role: 'customer',
    });

    const loyalty = await Loyalty.create({ user_id: user._id, balance: 0, transactions: [] });

    res.status(201).json({
      success: true,
      customer: {
        id: user._id,
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        points: loyalty.balance,
      },
      message: 'New customer created successfully',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3. Create POS Sale (Atomically deduct stock & credit/redeem points)
exports.createPosSale = async (req, res) => {
  try {
    const { user_id, items, payment_method = 'cash', redeem_points = 0 } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items are required' });
    }

    let customer = null;
    let loyaltyRecord = null;

    if (user_id) {
      customer = await User.findById(user_id);
      if (customer) {
        loyaltyRecord = await Loyalty.findOne({ user_id: customer._id });
        if (!loyaltyRecord) {
          loyaltyRecord = await Loyalty.create({ user_id: customer._id, balance: 0, transactions: [] });
        }
      }
    }

    // Process & validate items
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const prod = await Product.findById(item.product_id || item.id);
      if (!prod) {
        return res.status(400).json({ success: false, message: `Product not found: ${item.product_name || item.name}` });
      }

      const qty = Number(item.quantity) || 1;
      const unitPrice = Number(item.price || item.unit_price || prod.base_price || prod.price);
      const totalItemPrice = unitPrice * qty;
      const availableStock = prod.stock_qty !== undefined ? prod.stock_qty : (prod.stock !== undefined ? prod.stock : 30);

      // Check & deduct stock
      if (availableStock < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${prod.name}. Available: ${availableStock}`,
        });
      }

      // Deduct stock in DB immediately (both stock_qty and stock for compatibility)
      await Product.findByIdAndUpdate(prod._id, { $inc: { stock_qty: -qty, stock: -qty } });

      orderItems.push({
        product_id: prod._id,
        product_name: prod.name,
        weight: item.weight || '1 unit',
        quantity: qty,
        unit_price: unitPrice,
        total_price: totalItemPrice,
      });

      subtotal += totalItemPrice;
    }

    // Points Redemption calculation
    let pointsToRedeem = 0;
    let discountAmount = 0;

    if (loyaltyRecord && redeem_points > 0) {
      const maxRedeemable = Math.min(loyaltyRecord.balance, Math.floor(subtotal));
      pointsToRedeem = Math.min(Number(redeem_points), maxRedeemable);
      discountAmount = pointsToRedeem; // 1 point = ₹1 discount
    }

    const finalTotal = Math.max(0, subtotal - discountAmount);

    // Calculate Points Earned (e.g. 5 pts per ₹100 spent)
    const pointsEarned = Math.floor(finalTotal / 100) * 5;

    // Create POS Order Record
    const order = await Order.create({
      user_id: customer ? customer._id : req.user.id,
      address: { name: customer ? customer.name : 'In-Shop Customer', phone: customer ? customer.phone : 'POS Store Walkin' },
      items: orderItems,
      coupon_code: pointsToRedeem > 0 ? `PTS_REDEEM_${pointsToRedeem}` : '',
      subtotal,
      discount_amount: discountAmount,
      delivery_charge: 0,
      total: finalTotal,
      payment_method: payment_method.toLowerCase(),
      delivery_slot: 'Instant Counter Delivery',
      notes: 'In-Shop Counter Purchase (POS)',
      order_status: 'delivered',
      order_type: 'pos',
      payment_status: 'paid',
      points_earned: pointsEarned,
      points_redeemed: pointsToRedeem,
    });

    // Update Loyalty Ledger if customer linked
    if (loyaltyRecord) {
      let netPointsChange = pointsEarned - pointsToRedeem;
      loyaltyRecord.balance += netPointsChange;

      if (pointsToRedeem > 0) {
        loyaltyRecord.transactions.push({
          order_id: order._id,
          pts: -pointsToRedeem,
          reason: `Redeemed ${pointsToRedeem} points on POS Bill #${order._id.toString().slice(-6).toUpperCase()}`,
        });
      }
      if (pointsEarned > 0) {
        loyaltyRecord.transactions.push({
          order_id: order._id,
          pts: pointsEarned,
          reason: `Earned ${pointsEarned} points on POS Bill #${order._id.toString().slice(-6).toUpperCase()}`,
        });
      }

      await loyaltyRecord.save();
    }

    res.status(201).json({
      success: true,
      message: 'POS sale processed successfully!',
      order: {
        ...order.toObject(),
        id: order._id,
        customer_name: customer ? customer.name : 'Walk-in Customer',
        customer_phone: customer ? customer.phone : '',
        points_balance: loyaltyRecord ? loyaltyRecord.balance : 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

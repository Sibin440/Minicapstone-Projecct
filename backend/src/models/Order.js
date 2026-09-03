const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  product_name: String,
  weight: String,
  quantity: Number,
  unit_price: Number,
  total_price: Number,
});

const OrderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  address: { type: Object, required: true },
  items: [OrderItemSchema],
  coupon_code: { type: String, default: '' },
  subtotal: { type: Number, default: 0 },
  discount_amount: { type: Number, default: 0 },
  delivery_charge: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  payment_method: { type: String, default: 'cod' },
  delivery_slot: { type: String, default: '' },
  notes: { type: String, default: '' },
  order_status: { type: String, default: 'placed', enum: ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'] },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);

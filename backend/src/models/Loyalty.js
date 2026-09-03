const mongoose = require('mongoose');

const LoyaltySchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  balance: { type: Number, default: 0 },
  transactions: [{
    order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    pts: Number,
    reason: String,
    date: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Loyalty', LoyaltySchema);

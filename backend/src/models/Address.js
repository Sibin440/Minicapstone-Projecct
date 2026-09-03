const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address_line1: { type: String, required: true },
  address_line2: { type: String, default: '' },
  city: { type: String, required: true },
  state: { type: String, default: '' },
  pincode: { type: String, required: true },
  type: { type: String, default: 'Home' },
  is_default: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Address', AddressSchema);

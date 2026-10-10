const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, default: '' },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  address_line1: { type: String, default: '' },
  address_line2: { type: String, default: '' },
  city: { type: String, default: 'Chennai' },
  state: { type: String, default: 'Tamil Nadu' },
  pincode: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);

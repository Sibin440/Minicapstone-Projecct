const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Address = require('../models/Address');

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'svsbakery_secret', { expiresIn: '7d' });

const formatUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone || '',
  role: user.role,
  address_line1: user.address_line1 || '',
  address_line2: user.address_line2 || '',
  city: user.city || 'Chennai',
  state: user.state || 'Tamil Nadu',
  pincode: user.pincode || '',
});

exports.register = async (req, res) => {
  try {
    const {
      name, email, password, phone,
      address_line1 = '', address_line2 = '', city = 'Chennai', state = 'Tamil Nadu', pincode = ''
    } = req.body;

    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ success: false, message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      phone: phone || '',
      address_line1,
      address_line2,
      city: city || 'Chennai',
      state: state || 'Tamil Nadu',
      pincode,
    });

    // If an address was entered during registration, create default Address record
    if (address_line1 && pincode) {
      try {
        await Address.create({
          user_id: user._id,
          name,
          phone: phone || '',
          address_line1,
          address_line2,
          city: city || 'Chennai',
          state: state || 'Tamil Nadu',
          pincode,
          type: 'Home',
          is_default: 1,
        });
      } catch (_) {}
    }

    const token = signToken(user);
    res.status(201).json({ success: true, token, user: formatUserResponse(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });
    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const token = signToken(user);
    res.json({ success: true, token, user: formatUserResponse(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user: formatUserResponse(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const {
      name, phone,
      address_line1, address_line2, city, state, pincode
    } = req.body;

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (phone !== undefined) updateFields.phone = phone;
    if (address_line1 !== undefined) updateFields.address_line1 = address_line1;
    if (address_line2 !== undefined) updateFields.address_line2 = address_line2;
    if (city !== undefined) updateFields.city = city;
    if (state !== undefined) updateFields.state = state;
    if (pincode !== undefined) updateFields.pincode = pincode;

    const user = await User.findByIdAndUpdate(req.user.id, updateFields, { new: true }).select('-password');
    res.json({ success: true, user: formatUserResponse(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

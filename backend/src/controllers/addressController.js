const Address = require('../models/Address');

exports.getAll = async (req, res) => {
  try {
    const addresses = await Address.find({ user_id: req.user.id }).lean();
    res.json({ success: true, addresses: addresses.map(a => ({ ...a, id: a._id })) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.add = async (req, res) => {
  try {
    const { name, phone, address_line1, address_line2, city, state, pincode, type, is_default } = req.body;
    const address = await Address.create({ user_id: req.user.id, name, phone, address_line1, address_line2: address_line2 || '', city, state: state || '', pincode, type: type || 'Home', is_default: is_default || 0 });
    res.status(201).json({ success: true, address: { ...address.toObject(), id: address._id } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await Address.findOneAndDelete({ _id: req.params.id, user_id: req.user.id });
    res.json({ success: true, message: 'Address removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

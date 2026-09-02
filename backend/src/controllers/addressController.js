const { getDb } = require('../models/db');

exports.getAddresses = (req, res) => {
  const db = getDb();
  const addresses = db.prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC').all(req.user.id);
  res.json({ success: true, addresses });
};

exports.addAddress = (req, res) => {
  const db = getDb();
  const { name, phone, address_line1, address_line2, city, state, pincode, type = 'home', is_default = 0 } = req.body;
  if (!name || !phone || !address_line1 || !city || !state || !pincode)
    return res.status(400).json({ success: false, message: 'All required fields must be filled' });
  if (is_default) db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(req.user.id);
  const r = db.prepare(`INSERT INTO addresses (user_id, name, phone, address_line1, address_line2, city, state, pincode, type, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).
    run(req.user.id, name, phone, address_line1, address_line2 || null, city, state, pincode, type, is_default ? 1 : 0);
  const address = db.prepare('SELECT * FROM addresses WHERE id = ?').get(r.lastInsertRowid);
  res.status(201).json({ success: true, address });
};

exports.updateAddress = (req, res) => {
  const db = getDb();
  const { name, phone, address_line1, address_line2, city, state, pincode, type, is_default } = req.body;
  const existing = db.prepare('SELECT * FROM addresses WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!existing) return res.status(404).json({ success: false, message: 'Address not found' });
  if (is_default) db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(req.user.id);
  db.prepare(`UPDATE addresses SET name=?,phone=?,address_line1=?,address_line2=?,city=?,state=?,pincode=?,type=?,is_default=? WHERE id=?`).
    run(name || existing.name, phone || existing.phone, address_line1 || existing.address_line1, address_line2 || existing.address_line2, city || existing.city, state || existing.state, pincode || existing.pincode, type || existing.type, is_default ? 1 : 0, req.params.id);
  const address = db.prepare('SELECT * FROM addresses WHERE id = ?').get(req.params.id);
  res.json({ success: true, address });
};

exports.deleteAddress = (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM addresses WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!existing) return res.status(404).json({ success: false, message: 'Address not found' });
  db.prepare('DELETE FROM addresses WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'Address deleted' });
};

exports.setDefaultAddress = (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM addresses WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!existing) return res.status(404).json({ success: false, message: 'Address not found' });
  db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(req.user.id);
  db.prepare('UPDATE addresses SET is_default = 1 WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'Default address updated' });
};

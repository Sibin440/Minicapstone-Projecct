// Simple stub — coupons can be extended later
exports.apply = async (req, res) => {
  const { code, cart_total } = req.body;
  const coupons = {
    'SWEET10': { discount_type: 'percent', value: 10 },
    'SWEET20': { discount_type: 'percent', value: 20 },
    'FLAT50': { discount_type: 'flat', value: 50 },
  };
  const coupon = coupons[String(code).toUpperCase()];
  if (!coupon) return res.status(400).json({ success: false, message: 'Invalid or expired coupon' });
  const discount_amount = coupon.discount_type === 'percent'
    ? Math.round((cart_total * coupon.value) / 100)
    : coupon.value;
  res.json({ success: true, coupon: { code: code.toUpperCase(), discount_amount } });
};

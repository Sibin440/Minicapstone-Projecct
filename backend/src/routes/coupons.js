const router = require('express').Router();
const ctrl = require('../controllers/couponController');
const { authenticate } = require('../middleware/auth');
router.post('/apply', authenticate, ctrl.applyCoupon);
router.get('/', ctrl.getAllCoupons);
module.exports = router;

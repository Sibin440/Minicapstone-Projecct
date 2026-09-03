const router = require('express').Router();
const ctrl = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', ctrl.getMyOrders);
router.post('/', ctrl.placeOrder);
router.get('/:id', ctrl.getOrderById);

module.exports = router;

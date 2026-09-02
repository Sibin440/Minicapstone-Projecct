const router = require('express').Router();
const ctrl = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');
router.use(authenticate);
router.get('/', ctrl.getOrders);
router.post('/', ctrl.createOrder);
router.get('/:id', ctrl.getOrderById);
module.exports = router;

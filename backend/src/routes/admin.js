const router = require('express').Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const c = require('../controllers/adminController');

const admin = [authenticate, requireAdmin];

router.get('/dashboard', ...admin, c.getDashboard);

router.get('/products', ...admin, c.getProducts);
router.post('/products', ...admin, c.createProduct);
router.put('/products/:id', ...admin, c.updateProduct);
router.delete('/products/:id', ...admin, c.deleteProduct);

router.get('/orders', ...admin, c.getOrders);
router.put('/orders/:id/status', ...admin, c.updateOrderStatus);

router.get('/customers', ...admin, c.getCustomers);

router.get('/inventory', ...admin, c.getInventory);
router.put('/inventory/:id', ...admin, c.updateStock);

router.get('/loyalty/config', ...admin, c.getLoyaltyConfig);
router.put('/loyalty/config', ...admin, c.updateLoyaltyConfig);
router.get('/loyalty/ledger', ...admin, c.getLoyaltyPoints);

router.get('/analytics', ...admin, c.getAnalytics);
router.get('/prediction', ...admin, c.getPrediction);
router.get('/categories', ...admin, c.getCategories);

// Customer-facing: my loyalty points
router.get('/my-loyalty', authenticate, c.getMyLoyalty);

module.exports = router;

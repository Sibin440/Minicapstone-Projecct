const router = require('express').Router();
const ctrl = require('../controllers/productController');
router.get('/', ctrl.getAllProducts);
router.get('/featured', ctrl.getFeaturedProducts);
router.get('/search', ctrl.searchProducts);
router.get('/slug/:slug', ctrl.getProductBySlug);
router.get('/:id', ctrl.getProductById);
module.exports = router;

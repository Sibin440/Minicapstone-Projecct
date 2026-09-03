const router = require('express').Router();
const ctrl = require('../controllers/productController');

router.get('/', ctrl.getAll);
router.get('/featured', ctrl.getFeatured);
router.get('/search', ctrl.search);
router.get('/slug/:slug', ctrl.getBySlug);
router.get('/:id', ctrl.getById);

module.exports = router;

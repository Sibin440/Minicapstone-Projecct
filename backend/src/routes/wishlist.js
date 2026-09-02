const router = require('express').Router();
const ctrl = require('../controllers/wishlistController');
const { authenticate } = require('../middleware/auth');
router.use(authenticate);
router.get('/', ctrl.getWishlist);
router.post('/', ctrl.addToWishlist);
router.get('/check/:productId', ctrl.checkWishlist);
router.delete('/:productId', ctrl.removeFromWishlist);
module.exports = router;

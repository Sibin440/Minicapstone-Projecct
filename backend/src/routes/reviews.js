const router = require('express').Router();
const ctrl = require('../controllers/reviewController');
const { authenticate } = require('../middleware/auth');

router.get('/:productId', ctrl.getReviews);
router.post('/:productId', authenticate, ctrl.addReview);

module.exports = router;

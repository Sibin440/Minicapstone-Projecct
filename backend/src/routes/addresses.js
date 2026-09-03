const router = require('express').Router();
const ctrl = require('../controllers/addressController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', ctrl.getAll);
router.post('/', ctrl.add);
router.delete('/:id', ctrl.remove);

module.exports = router;

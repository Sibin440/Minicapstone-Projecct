const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const posController = require('../controllers/posController');

// All POS routes require authentication and admin authorization
router.get('/customers/search', authenticate, requireAdmin, posController.lookupCustomer);
router.post('/customers/quick-register', authenticate, requireAdmin, posController.quickRegister);
router.post('/sale', authenticate, requireAdmin, posController.createPosSale);

module.exports = router;

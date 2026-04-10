const express = require('express');
const { getShop, updateShop, checkTrialStatus, recordPayment } = require('../controllers/shopsController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Check trial status (public endpoint) - must come before /:shopId
router.get('/:shopId/trial-status', checkTrialStatus);

// Get shop info
router.get('/:shopId', authMiddleware, getShop);

// Update shop
router.put('/:shopId', authMiddleware, updateShop);

// Record payment
router.post('/:shopId/payment', recordPayment);

module.exports = router;

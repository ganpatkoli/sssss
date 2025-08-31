const express = require('express');
const { getMyLoyalty, redeemPoints } = require('../controllers/loyaltyController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/my', protect, getMyLoyalty);
router.post('/redeem', protect, redeemPoints);

module.exports = router;

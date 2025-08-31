const express = require('express');
const { getMyNotifications, readNotification } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/my', protect, getMyNotifications);          // Get all user notifications
router.patch('/:id/read', protect, readNotification);    // Mark as read

module.exports = router;


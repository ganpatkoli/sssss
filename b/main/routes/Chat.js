


const express = require('express');
const { sendMessage, getUserChats } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/send', protect, sendMessage);
router.get('/my', protect, getUserChats);

module.exports = router;

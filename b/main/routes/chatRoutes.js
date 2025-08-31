const express = require('express');
const { getOrCreateChat, sendMessage, getUserChats } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/open', protect, getOrCreateChat);           // Open chat for this pair/trip
router.post('/send', protect, sendMessage);               // Send a message in chat
router.get('/my', protect, getUserChats);                 // List all chats/user

module.exports = router;

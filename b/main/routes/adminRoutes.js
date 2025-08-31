const express = require('express');
const { listAgents, verifyAgent, toggleBlockAgent } = require('../controllers/adminController');
const { protect, superadminOnly } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/agents', protect, superadminOnly, listAgents);
router.patch('/agents/:agentId/verify', protect, superadminOnly, verifyAgent);
router.patch('/agents/:agentId/block', protect, superadminOnly, toggleBlockAgent);
// router.use('/admin-only-action', protect, superadminOnly, handlerFunction);

module.exports = router;

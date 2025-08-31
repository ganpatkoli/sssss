const express = require('express');
const { getPlatformStats, getAgentStats ,monthlyBookingsByAgent ,  monthlyStats  ,agentLeaderboard ,  bookingsByPackage} = require('../controllers/analyticsController');
const { protect, superadminOnly  , adminOnly} = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/platform', protect, getPlatformStats);          // Superadmin stats
router.get('/agent', protect, getAgentStats);                // Admin/Agent stats

router.get('/monthly-bookings', protect, superadminOnly, monthlyBookingsByAgent);


// Monthly bookings and revenue stats (admin/superadmin access)
router.get('/monthly-stats', protect, adminOnly, monthlyStats);

// Agent bookings and revenue leaderboard (admin/superadmin access)
router.get('/agent-leaderboard', protect, adminOnly, agentLeaderboard);

// Bookings grouped by package type (admin/superadmin)
router.get('/bookings-by-package', protect, adminOnly, bookingsByPackage);
module.exports = router;

const express = require('express');
const { getAllLogs ,exportLogs , filterLogs} = require('../controllers/auditController');
const { protect, superadminOnly } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', protect, superadminOnly, getAllLogs);
router.get('/search', protect, superadminOnly, filterLogs);
// E.g. /api/audit/search?action=superadmin-verify-agent&from=2025-08-01&to=2025-08-05&limit=50

router.get('/export', protect, superadminOnly, exportLogs);


module.exports = router;
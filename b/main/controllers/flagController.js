const Flag = require('../models/Flag');

// User reports any entity
exports.createFlag = async (req, res) => {
  try {
    const { flaggedType, flaggedId, reason } = req.body;
    const flag = new Flag({
      reportedBy: req.user.id,
      flaggedType,
      flaggedId,
      reason
    });
    await flag.save();
    res.status(201).json({ message: 'Reported! Admins will review.', flag });
  } catch (err) {
    res.status(500).json({ message: 'Report failed', error: err.message });
  }
};

// Admin fetches all pending flags
exports.getAllFlags = async (req, res) => {
  try {
    const flags = await Flag.find({ status: 'pending' }).populate('reportedBy', 'name email');
    res.json(flags);
  } catch (err) {
    res.status(500).json({ message: 'Fetch failed', error: err.message });
  }
};

// Superadmin resolves a flag
exports.resolveFlag = async (req, res) => {
  try {
    const { action, adminNote } = req.body; // 'resolved' | 'dismissed'
    const flag = await Flag.findById(req.params.flagId);
    if (!flag) return res.status(404).json({ message: 'Flag not found' });
    flag.status = action;
    flag.adminNote = adminNote;
    flag.resolvedBy = req.user.id;
    flag.resolvedAt = new Date();
    await flag.save();
    res.json({ message: `Flag ${action}`, flag });
  } catch (err) {
    res.status(500).json({ message: 'Resolve failed', error: err.message });
  }
};

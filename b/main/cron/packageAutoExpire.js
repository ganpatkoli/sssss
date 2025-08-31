const cron = require('node-cron');
const User = require('../models/User');
const { sendNotification } = require('../controllers/notificationController');

cron.schedule('0 1 * * *', async () => {
  try {
    // Find users with packages expired till now & still marked as active
    const now = new Date();
    const users = await User.find({
      packageId: { $ne: null },
      packageValidTill: { $lte: now }
    });

    for (const user of users) {
      // Auto-expire main package assignment
      const prevPkg = user.packageId;
      user.packageId = null;
      user.packageValidTill = null;

      // Package history: mark latest as expired
      if (user.packageHistory && user.packageHistory.length > 0) {
        const lastEntry = user.packageHistory[user.packageHistory.length - 1];
        if (lastEntry.status === "active") lastEntry.status = "expired";
      }

      await user.save();

      // Notify user about expiry
      await sendNotification(
        user._id,
        "Package Expired",
        "Your package has expired. Renew/upgrade to keep using premium features.",
        "/plans"
      );
    }
    console.log(`[Package Cron] Auto-expiry done for ${users.length} user(s)`);
  } catch (err) {
    console.error('[Package Cron] Auto-expiry job error:', err.message);
  }
});

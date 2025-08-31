// cron/packageExpiryNotifier.js
const User = require("../models/User");
const { sendNotification } = require("../controllers/notificationController");
const cron = require("node-cron");

cron.schedule("0 10 * * *", async () => {
  const soonExpiring = await User.find({
    packageValidTill: {
      $gte: new Date(),
      $lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  });
  for (const user of soonExpiring) {
    await sendNotification(
      user._id,
      "Package expiry reminder",
      "Your agent/admin package expires soon. Please renew to avoid interruption.",
      "/plans"
    );
  }
});

cron.schedule("0 10 * * *", async () => {
  // Roz subah 10 baje chalega
  try {
    const now = new Date();
    const soonExpiring = await User.find({
      packageId: { $ne: null },
      packageValidTill: {
        $gt: now,
        $lte: new Date(now.getTime() + 3 * 86400000),
      },
    });

    for (const user of soonExpiring) {
      await sendNotification(
        user._id,
        "Package Expiry Soon",
        "Your current plan will expire in 3 days. Renew/upgrade now to avoid interruption.",
        "/plans"
      );
    }
    console.log(
      `[Package Expiry Notifier] Sent reminder to ${soonExpiring.length} users.`
    );
  } catch (err) {
    console.error("[Package Expiry Notifier] Error:", err.message);
  }
});

const Notification = require("../models/Notification");

// Create/send notification (any event)
exports.sendNotification = async (userId, title, message, link = null) => {
  const notif = new Notification({
    userId,
    title,
    message,
    link,
  });
  await notif.save();
  // Optional: for real-time, emit socket event here
  return notif;
};

// Fetch all notifications for a user
exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort(
      { createdAt: -1 }
    );
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Fetch failed", error: err.message });
  }
};

// Mark notification as read
exports.readNotification = async (req, res) => {
  try {
    const notif = await Notification.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!notif) return res.status(404).json({ message: "Not found" });
    notif.read = true;
    await notif.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};

// const { sendNotification } = require('./notificationController');
// // ...after booking create successful
// await sendNotification(trip.agentId, "New Booking!", `User ${req.user.name} booked your trip.`, `/booking/${booking._id}`);
// await sendNotification(req.user.id, "Booking Success", `You booked trip ${trip.title}!`, `/booking/${booking._id}`);

const cron = require('node-cron');
const Booking = require('../models/Booking');
const { sendNotification } = require('../controllers/notificationController');
// const { sendEmail } = require('../services/emailService'); // Optional: अगर email भी भेजना हो



cron.schedule('0 8 * * *', async () => { // Every day at 8 AM
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bookings = await Booking.find({ paymentStatus: 'completed', status: 'active' })
      .populate('tripId userId');

    let remindedCount = 0;
    for (const booking of bookings) {
      if (booking.tripId && booking.tripId.startDate) {
        const tripDate = new Date(booking.tripId.startDate);
        tripDate.setHours(0, 0, 0, 0);

        if (tripDate.getTime() === today.getTime()) {
          await sendNotification(
            booking.userId._id,
            "Trip Reminder",
            `Remember your trip today: "${booking.tripId.title.en || booking.tripId.title}"`,
            `/booking/${booking._id}`
          );
          remindedCount++;
        }
      }
    }

    if (remindedCount)
      console.log(`Sent ${remindedCount} trip reminders for today.`);
  } catch (error) {
    console.error("Error in daily trip reminder cron:", error);
  }
});

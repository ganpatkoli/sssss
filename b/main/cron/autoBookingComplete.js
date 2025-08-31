const cron = require('node-cron');
const Booking = require('../models/Booking');
const { sendNotification } = require('../controllers/notificationController');
// const { sendEmail } = require('../services/emailService'); // Optional: अगर email भी भेजना हो

// Daily at 2am, auto-complete finished bookings and notify users
cron.schedule('0 2 * * *', async () => {
  try {
    const now = new Date();

    // सभी active bookings जिनकी payment पूरी हो चुकी है
    const bookings = await Booking.find({ status: 'active', paymentStatus: 'completed' })
      .populate('tripId')
      .populate('userId');

    let completedCount = 0;

    for (const booking of bookings) {
      if (booking.tripId && booking.tripId.endDate && now > booking.tripId.endDate) {
        booking.status = 'completed';
        await booking.save();
        completedCount++;

        // Send app notification
        await sendNotification(
          booking.userId._id,
          "Trip Completed",
          `Your trip "${booking.tripId.title.en || booking.tripId.title}" is now marked as completed.`,
          `/booking/${booking._id}`
        );

        // (Optional) Send email notification
        // await sendEmail(
        //   booking.userId.email,
        //   "Your Trip is Completed",
        //   `Your booking for "${booking.tripId.title.en || booking.tripId.title}" has been completed.`
        // );
      }
    }

    console.log(`Auto-completed ${completedCount} bookings and notified users at ${now.toISOString()}`);
  } catch (err) {
    console.error('Booking auto-complete job failed:', err.message);
  }
});

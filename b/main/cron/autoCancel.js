const cron = require('node-cron');
const Booking = require('../models/Booking');
const Trip = require('../models/Trip');
const { sendNotification } = require('../controllers/notificationController');

cron.schedule('*/5 * * * *', async () => {  // हर 5 मिनट में चलेगा
  try {
    const now = new Date();
    const cutoff = new Date(now.getTime() - 15 * 60 * 1000); // 15 मिनट पहले

    const bookings = await Booking.find({
      status: 'active',
      paymentStatus: 'pending',
      createdAt: { $lte: cutoff }
    }).populate('tripId userId');

    for (const booking of bookings) {
      if (booking.tripId) {
        booking.tripId.availableSeats += booking.seatsBooked;
        await booking.tripId.save();
      }

      booking.status = 'cancelled';
      booking.paymentStatus = 'cancelled';
      await booking.save();

      await sendNotification(
        booking.userId._id,
        "Booking Cancelled (Payment Timeout)",
        "Your booking was cancelled because you did not complete the payment in time.",
        `/booking/${booking._id}`
      );
    }

    if (bookings.length)
      console.log(`Auto-cancelled ${bookings.length} bookings due to payment timeout.`);
  } catch (error) {
    console.error("Error in payment timeout auto-cancel cron:", error);
  }
});

const cron = require('node-cron');
const Booking = require('../models/Booking');
const { sendEmail } = require('../services/emailService');

// Example: Daily booking reminder to users (8am)
cron.schedule('0 8 * * *', async () => {
  try {
    // Find bookings for today
    const today = new Date();
    today.setHours(0,0,0,0);
    const bookings = await Booking.find({ startDate: today, status: 'active' }).populate('userId');
    for (const booking of bookings) {
      await sendEmail(booking.userId.email, "Trip Reminder", `Remember your trip today: ${booking.tripId}`);
    }
    console.log(`Sent ${bookings.length} daily reminders`);
  } catch (err) {
    console.error('Daily reminder job failed:', err.message);
  }
});

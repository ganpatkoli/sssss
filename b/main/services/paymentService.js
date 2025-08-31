// services/paymentService.js
// Is real project me razorpay/stripe ka webhook yahan lagega.


const Booking = require('../models/Booking');

exports.markBookingPaid = async (bookingId, amount) => {
  // verification and gateway integration logic yahan insert ho sakti hai (Razorpay/Stripe webhook, etc.)
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new Error('Booking not found');
  booking.paymentStatus = 'completed';
  booking.pricePaid = amount;
  await booking.save();
  return booking;
};




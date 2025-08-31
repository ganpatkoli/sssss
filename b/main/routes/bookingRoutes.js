// const express = require("express");
// const {
//   createBooking,
//   cancelBooking,
//   getUserBookings,
//   getTripBookings,
//   verifyBookingQR,
//   getUserBookingDetails,
//   cancelUserBooking,
// } = require("../controllers/bookingController");
// const { protect, adminOnly, checkAgentStatus } = require("../middleware/authMiddleware");

// const router = express.Router();

// // User books a trip
// router.post("/", protect, createBooking);

// // User's booking history (basic list)
// router.get("/my", protect, getUserBookings);

// // User's full booking details with nested trip and agent info
// router.get("/my/details", protect, getUserBookingDetails);

// // Admin: get all bookings for a specific trip
// router.get("/trip/:tripId", protect, adminOnly, getTripBookings);

// // Cancel a booking (user or admin)
// router.patch("/:bookingId/cancel", protect, cancelUserBooking);

// // Verify booking by scanning QR (agent only)
// router.post("/verify-qr", protect, checkAgentStatus, verifyBookingQR);

// module.exports = router;



const express = require("express");
const {
  createBooking,
  cancelBooking,
  getUserBookings,
  getTripBookings,
  verifyBookingQR,
  getUserBookingDetails,
  // cancelUserBooking,
  updatePaymentStatus,
  getAdminTripsWithBookingAndUserDetailsPaginated,
  completeBooking,

} = require("../controllers/bookingController");
const { protect, adminOnly, checkAgentStatus } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createBooking);
router.get("/my", protect, getUserBookings);
router.get("/my/details", protect, getUserBookingDetails);
router.get("/trip/:tripId", protect, adminOnly, getTripBookings);
router.patch("/:bookingId/cancel", protect, cancelBooking);
router.post("/verify-qr", protect, checkAgentStatus, verifyBookingQR);
router.put("/:bookingId/payment", protect, updatePaymentStatus);      // नए addition
router.put("/:bookingId/complete", protect, completeBooking);          // नए addition
router.get("/trips-booking-users", protect, getAdminTripsWithBookingAndUserDetailsPaginated);
module.exports = router;

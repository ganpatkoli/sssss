// const Booking = require("../models/Booking");
// const Trip = require("../models/Trip");
// const crypto = require("crypto");
// const qrcode = require("qrcode");
// const { sendNotification } = require("./notificationController");

// // Create new booking with travellers info
// exports.createBooking = async (req, res) => {
//   try {
//     console.log("Create booking request:", req.body);
//     const { tripId, seatsBooked, pricePaid, travellers } = req.body;

//     // Validate travellers array length matches seatsBooked
//     if (!travellers || !Array.isArray(travellers) || travellers.length !== seatsBooked) {
//       return res.status(400).json({ message: "Traveller details must be provided for each seat." });
//     }
//     for (const t of travellers) {
//       if (!t.name || t.name.trim() === "") {
//         return res.status(400).json({ message: "Each traveller must have a name." });
//       }
//     }

//     const trip = await Trip.findById(tripId);
//     if (!trip) return res.status(404).json({ message: "Trip not found" });

//     if (trip.availableSeats < seatsBooked) {
//       return res.status(400).json({ message: "Not enough seats available for booking" });
//     }

//     const qrCodeData = crypto.randomUUID() + "-" + Date.now();
//     const qrCodeExpiresAt = trip.startDate;

//     trip.availableSeats -= seatsBooked;
//     await trip.save();

//     const booking = new Booking({
//       tripId,
//       userId: req.user.id,
//       qrCodeData,
//       qrCodeExpiresAt,
//       seatsBooked,
//       pricePaid,
//       travellers,
//       paymentStatus: "pending",
//       status: "active",
//     });
//     await booking.save();

//     const qrImage = await qrcode.toDataURL(qrCodeData);

//     res.status(201).json({
//       message: "Booking successfully created",
//       booking,
//       qrImage,
//     });
//   } catch (error) {
//     console.error("Create booking error:", error);
//     res.status(500).json({ message: "Server error creating booking" });
//   }
// };

// exports.getUserBookings = async (req, res) => {
//   try {
//     const bookings = await Booking.find({ userId: req.user.id }).populate("tripId");
//     res.json(bookings);
//   } catch (error) {
//     res.status(500).json({ message: "Failed to fetch bookings" });
//   }
// };


// exports.cancelBooking = async (req, res) => {
//   try {
//     const booking = await Booking.findById(req.params.bookingId).populate("tripId");
//     if (!booking) return res.status(404).json({ message: "Booking not found" });

//     if (
//       booking.userId.toString() !== req.user.id &&
//       req.user.role !== "admin" &&
//       req.user.role !== "superadmin"
//     )
//       return res.status(403).json({ message: "Not authorized to cancel" });

//     if (booking.status === "cancelled")
//       return res.status(400).json({ message: "Booking already cancelled" });

//     const trip = await Trip.findById(booking.tripId._id);
//     trip.availableSeats += booking.seatsBooked;
//     await trip.save();

//     booking.status = "cancelled";
//     booking.paymentStatus = "cancelled";
//     await booking.save();

//     await sendNotification(
//       booking.userId,
//       "Booking Cancelled",
//       `Your booking for trip "${trip.title.en || trip.title}" has been cancelled.`,
//       `/booking/${booking._id}`
//     );
//     await sendNotification(
//       trip.agentId,
//       "Booking Cancelled",
//       `A booking for your trip "${trip.title.en || trip.title}" was cancelled.`,
//       `/trip/${trip._id}`
//     );

//     res.json({ message: "Booking cancelled successfully", booking });
//   } catch (error) {
//     console.error("Cancel booking error:", error);
//     res.status(500).json({ message: "Server error cancelling booking" });
//   }
// };



// // Fetch full booking details by user with trip, agent, and traveller info

// // Cancel booking API with detailed info and permission check
// exports.cancelUserBooking = async (req, res) => {
//   try {
//     const bookingId = req.params.bookingId;
//     const userId = req.user.id;
//     const userRole = req.user.role;

//     const booking = await Booking.findById(bookingId).populate("tripId agentId");

//     if (!booking) {
//       return res.status(404).json({ message: "Booking not found." });
//     }

//     // Permit cancellation only if owner or admin
//     if (
//       booking.userId.toString() !== userId &&
//       userRole !== "admin" &&
//       userRole !== "superadmin"
//     ) {
//       return res.status(403).json({ message: "Not authorized to cancel this booking." });
//     }

//     if (booking.status === "cancelled") {
//       return res.status(400).json({ message: "Booking is already cancelled." });
//     }

//     // Update trip seat availability
//     booking.tripId.availableSeats += booking.seatsBooked;
//     await booking.tripId.save();

//     // Update booking status
//     booking.status = "cancelled";
//     booking.paymentStatus = "cancelled";
//     await booking.save();

//     // Send notifications to user and agent
//     await sendNotification(
//       booking.userId,
//       "Booking Cancelled",
//       `Your booking for "${booking.tripId.title.en || booking.tripId.title}" has been cancelled.`,
//       `/booking/${booking._id}`
//     );

//     await sendNotification(
//       booking.tripId.agentId,
//       "Booking Cancelled",
//       `A booking for your trip "${booking.tripId.title.en || booking.tripId.title}" was cancelled.`,
//       `/trip/${booking.tripId._id}`
//     );

//     res.json({ message: "Booking cancelled successfully.", booking });
//   } catch (error) {
//     console.error("Error cancelling booking:", error);
//     res.status(500).json({ message: "Server error cancelling booking." });
//   }
// };






const Booking = require("../models/Booking");
const Trip = require("../models/Trip");
const crypto = require("crypto");
const qrcode = require("qrcode");
const { sendNotification } = require("./notificationController");
const { log } = require("console");

// Create new booking with travellers info - payment pending initially
exports.createBooking = async (req, res) => {
  try {
    const { tripId, seatsBooked, seatType, pricePaid, travellers } = req.body;

    // SeatType validation (optional but recommended)
    const validSeatTypes = ["single", "couple", "group"];
    if (!validSeatTypes.includes(seatType)) {
      return res.status(400).json({ message: "Invalid seat type selected." });
    }

    // Existing validation for travellers
    if (!travellers || !Array.isArray(travellers) || travellers.length !== seatsBooked) {
      return res.status(400).json({ message: "Traveller details must be provided for each seat." });
    }
    for (const t of travellers) {
      if (!t.name || t.name.trim() === "") {
        return res.status(400).json({ message: "Each traveller must have a name." });
      }
    }

    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    if (trip.availableSeats < seatsBooked) {
      return res.status(400).json({ message: "Not enough seats available for booking" });
    }

    const qrCodeData = crypto.randomUUID() + "-" + Date.now();
    const qrCodeExpiresAt = trip.startDate;

    trip.availableSeats -= seatsBooked;
    await trip.save();

    const booking = new Booking({
      tripId,
      userId: req.user.id,
      seatType, // new field populated!
      qrCodeData,
      qrCodeExpiresAt,
      seatsBooked,
      pricePaid,
      travellers,
      paymentStatus: "pending",
      status: "active", // active but unpaid
    });
    console.log("New booking created:", booking);

    await booking.save();

    const qrImage = await qrcode.toDataURL(qrCodeData);

    res.status(201).json({
      message: "Booking created with pending payment",
      booking,
      qrImage,
    });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({ message: "Server error creating booking" });
  }
};


// Update payment status (called after payment gateway success)
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { paymentStatus, paymentRef } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.paymentStatus = paymentStatus;
    if (paymentRef) booking.paymentRef = paymentRef;

    // If payment completed, user trip considered active/upcoming
    if (paymentStatus === "completed") {
      booking.status = "active"; // Meaningfully, now valid upcoming trip
    }

    await booking.save();

    res.json({ message: "Payment status updated", booking });
  } catch (err) {
    res.status(500).json({ message: "Failed to update payment", error: err.message });
  }
};

// Get all bookings of logged in user with pagination, status filter, and date filter
exports.getUserBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, startDate, endDate } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1) {
      return res.status(400).json({ message: "Invalid page or limit" });
    }

    // Build dynamic filter
    let filter = { userId: req.user.id };

    // Status filter
    if (status) {
      if (status !== "all" && status !== "cancelled" && !["active", "ongoing", "completed", "upcoming"].includes(status)) {
        return res.status(400).json({ message: "Invalid status filter" });
      }
      if (status !== "all") filter.status = status === "cancelled" ? "cancelled" : status;
    } else {
      // Default: exclude cancelled
      filter.status = { $ne: "cancelled" };
    }

    // Date filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const totalBookings = await Booking.countDocuments(filter);

    const bookings = await Booking.find(filter)
      .populate("tripId")
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    res.json({
      page: pageNum,
      limit: limitNum,
      total: totalBookings,
      totalPages: Math.ceil(totalBookings / limitNum),
      bookings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};



// Cancel booking (can be done only if active or pending)
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId).populate("tripId");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (
      booking.userId.toString() !== req.user.id &&
      req.user.role !== "admin" &&
      req.user.role !== "superadmin"
    )
      return res.status(403).json({ message: "Not authorized to cancel" });

    if ((booking.status === "cancelled") || (booking.paymentStatus === "cancelled"))
      return res.status(400).json({ message: "Booking already cancelled" });

    const trip = await Trip.findById(booking.tripId._id);
    trip.availableSeats += booking.seatsBooked;
    await trip.save();

    booking.status = "cancelled";
    booking.paymentStatus = "cancelled";
    await booking.save();

    await sendNotification(
      booking.userId,
      "Booking Cancelled",
      `Your booking for trip "${trip.title.en || trip.title}" has been cancelled.`,
      `/booking/${booking._id}`
    );
    await sendNotification(
      trip.agentId,
      "Booking Cancelled",
      `A booking for your trip "${trip.title.en || trip.title}" was cancelled.`,
      `/trip/${trip._id}`
    );

    res.json({ message: "Booking cancelled successfully", booking });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({ message: "Server error cancelling booking" });
  }
};

// Mark booking as completed (manually or auto)
exports.completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = "completed";
    await booking.save();

    res.json({ message: "Booking marked as completed", booking });
  } catch (error) {
    res.status(500).json({ message: "Failed to complete booking", error: error.message });
  }
};

// Mark trip as completed (agent side)
exports.completeTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    trip.status = "completed";
    await trip.save();

    res.json({ message: "Trip marked as completed", trip });
  } catch (error) {
    res.status(500).json({ message: "Failed to complete trip", error: error.message });
  }
};



exports.verifyBookingQR = async (req, res) => {
  try {
    const { qrCode } = req.body;

    const booking = await Booking.findOne({ qrCodeData: qrCode })
      .populate("tripId")
      .populate("userId", "name email");

    if (!booking) return res.status(404).json({ message: "Invalid QR code." });

    if (booking.qrCodeVerified)
      return res.status(400).json({ message: "QR already used." });

    if (new Date() > booking.qrCodeExpiresAt)
      return res.status(400).json({ message: "QR code expired." });

    if (booking.paymentStatus !== "completed" || booking.status !== "active")
      return res.status(400).json({ message: "Booking not active or unpaid." });

    booking.qrCodeVerified = true;
    await booking.save();

    res.json({
      message: "Check-in verified! (Booking validated and QR expired)",
      bookingId: booking._id,
      trip: booking.tripId,
      user: booking.userId,
      travellers: booking.travellers,
    });
  } catch (error) {
    console.error("QR Verification error:", error);
    res.status(500).json({ message: "Server error during verification." });
  }
};


exports.getUserBookingDetails = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch bookings with populated trip and agent details
    const bookings = await Booking.find({ userId })
      .populate({
        path: "tripId",
        populate: { path: "agentId", select: "name email avatar" },
      })
      .populate("userId", "name email");

    if (bookings.length === 0) {
      return res.status(404).json({ message: "No bookings found for this user." });
    }

    res.json({ bookings });
  } catch (error) {
    console.error("Error fetching user booking details:", error);
    res.status(500).json({ message: "Server error fetching bookings." });
  }
};


exports.getTripBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ tripId: req.params.tripId })
      .populate("userId", "name email");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch trip bookings" });
  }
};


exports.getAdminTripsWithBookingAndUserDetailsPaginated = async (req, res) => {
  // try {

    console.log("Admin ID:", req);

  //   const adminId = req.user.id;
  //   const page = parseInt(req.query.page) || 1;  // default page 1
  //   const limit = parseInt(req.query.limit) || 10; // default 10 items per page
  //   const skip = (page - 1) * limit;

  //   console.log("Admin ID:", adminId, "Page:", page, "Limit:", limit);

  //   return;
  //   // Get trips managed by admin with pagination
  //   const totalTrips = await Trip.countDocuments({ agentId: adminId });

  //   const trips = await Trip.find({ agentId: adminId })
  //     .select("_id title")
  //     .sort({ createdAt: -1 })
  //     .skip(skip)
  //     .limit(limit);

  //   const tripIds = trips.map((t) => t._id);

  //   // Aggregate bookings with user details grouped by tripId (only for trips in current page)
  //   const bookingsWithUsers = await Booking.aggregate([
  //     { $match: { tripId: { $in: tripIds.map(id => new mongoose.Types.ObjectId(id)) } } },
  //     {
  //       $lookup: {
  //         from: "users",
  //         localField: "userId",
  //         foreignField: "_id",
  //         as: "userDetails",
  //       },
  //     },
  //     { $unwind: "$userDetails" },

  //     {
  //       $group: {
  //         _id: "$tripId",
  //         totalBookings: { $sum: 1 },
  //         totalSeatsBooked: { $sum: "$seatsBooked" },
  //         users: {
  //           $push: {
  //             userId: "$userDetails._id",
  //             name: "$userDetails.name",
  //             email: "$userDetails.email",
  //             phone: "$userDetails.phone",
  //             email: "$userDetails.email",

  //           },
  //         },
  //       },
  //     },
  //   ]);

  //   // Map bookings by tripId for quick lookup
  //   const bookingsMap = {};
  //   bookingsWithUsers.forEach((b) => {
  //     bookingsMap[b._id.toString()] = b;
  //   });

  //   const response = trips.map((trip) => {
  //     const bookingInfo = bookingsMap[trip._id.toString()];
  //     return {
  //       tripId: trip._id,
  //       title: trip.title,
  //       totalBookings: bookingInfo?.totalBookings || 0,
  //       totalSeatsBooked: bookingInfo?.totalSeatsBooked || 0,
  //       users: bookingInfo?.users || [],
  //     };
  //   });

  //   return res.json({
  //     totalTrips,
  //     page,
  //     limit,
  //     totalPages: Math.ceil(totalTrips / limit),
  //     trips: response,
  //   });
  // } catch (error) {
  //   console.error("Error fetching paginated trips booking details:", error);
  //   return res.status(500).json({ message: "Server error fetching bookings with pagination" });
  // }
};

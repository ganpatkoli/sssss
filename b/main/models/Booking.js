const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },
    paymentRef: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    qrCodeData: String, // Unique QR string (not image, just the code content)
    qrCodeExpiresAt: Date, // QR ki expiry time (usually trip start time)
    qrCodeVerified: { type: Boolean, default: false },
    seatsBooked: { type: Number, default: 1 },
    seatType: {
      type: String,
      enum: ["single", "couple", "group"],
      default: "single",
    },
    pricePaid: Number,
    
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
    bookingDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["active", "ongoing", "cancelled", "completed", "upcoming"],
      default: "active",
    },

    feedback : String,
    rating: { type: Number, min: 1, max: 5 },


    travellers: [
      {
        name: { type: String, required: true },
        age: { type: String },
        gender: { type: String },
      }
    ],
    // New booking fields
    pickupPoint: String,
    dropPoint: String,
    guideSelected: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);







// status =active   ----   paymentStatus=pending 
// status =cancelled  -----   paymentStatus=cancelled
// status =completed  -----   paymentStatus=completed
// status =ongoing  -----   paymentStatus=completed
// status =upcoming  -----   paymentStatus=completed




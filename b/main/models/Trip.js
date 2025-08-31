// Trip Schema with pickup, drop, guide, cancellation policy and pricing

const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    agentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    route: { from: String, to: String, stops: [String] },
    inclusions: [String],

    price: {
      single: Number,
      couple: Number,
      group: Number,
    },

    startDate: Date,
    endDate: Date,
    availableSeats: Number,
    totalSeats: Number,
    images: [String],
    status: { type: String, enum: ["draft", "published" , "completed"], default: "draft" },

    title: {
      en: String,
      hi: String,
      es: String,
    },
    description: {
      en: String,
      hi: String,
      es: String,
    },

    // Location field (GeoJSON Point)
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: {
        type: [Number], // Order: [longitude, latitude]
        required: true,
      },
    },

    // New fields without time slots
    pickupPoints: [String],
    dropPoints: [String],
    guideAvailable: { type: Boolean, default: false },
    cancellationPolicy: { type: String },
  },
  { timestamps: true }
);

tripSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Trip", tripSchema);

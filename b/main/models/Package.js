const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },    // e.g. "Basic", "Pro"
  price: { type: Number, required: true },                 // INR/USD, monthly/annual, etc.
  durationDays: { type: Number, required: true },          // e.g. 30, 90, 365
  features: [String],                                      // ["10 bookings/day", "priority support"]
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Package', packageSchema);

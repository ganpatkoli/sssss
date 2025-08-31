const mongoose = require('mongoose');
const loyaltySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  points: { type: Number, default: 0 },
  history: [
    {
      type: { type: String, enum: ['booking', 'review', 'referral'], required: true },
      value: Number,
      note: String,
      date: { type: Date, default: Date.now }
    }
  ],
  referralCode: { type: String, unique: true },      // e.g. generated code
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // who invited
});
module.exports = mongoose.model('Loyalty', loyaltySchema);

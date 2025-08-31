const mongoose = require('mongoose');
const flagSchema = new mongoose.Schema({
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  flaggedType: { type: String, enum: ['trip', 'user', 'booking', 'review'], required: true },
  flaggedId: { type: mongoose.Schema.Types.ObjectId, required: true },
  reason: String,
  status: { type: String, enum: ['pending', 'resolved', 'dismissed'], default: 'pending' },
  adminNote: String,
  createdAt: { type: Date, default: Date.now },
  resolvedAt: Date,
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});
module.exports = mongoose.model('Flag', flagSchema);

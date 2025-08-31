const mongoose = require('mongoose');
const chatSchema = new mongoose.Schema({
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  ], // [user, agent/admin]
  messages: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      content: String,
      timestamp: { type: Date, default: Date.now }
    }
  ],
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' }, // optional: trip-specific chat
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Chat', chatSchema);
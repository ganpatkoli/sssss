// models/AuditLog.js
const mongoose = require('mongoose');


const auditSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Kis user/admin/superadmin ne action liya
  action: { type: String, required: true },                      // Action type (e.g., 'superadmin-verify-agent')
  details: { type: Object },                                     // Extra info (kaunse agent ko verify kiya, etc.)
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('AuditLog', auditSchema);

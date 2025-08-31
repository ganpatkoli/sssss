const { logAction } = require('../utils/auditLogger');

// example: agent verify in adminController.js
exports.verifyAgent = async (req, res) => {
  // ...existing verification code...
  await logAction(req.user.id, 'superadmin-verify-agent', { agentId: agent._id });
  // ...rest of the code...
};

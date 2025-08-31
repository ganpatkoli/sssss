const User = require('../models/User');

// List all agents/admins (for superadmin)
exports.listAgents = async (req, res) => {
  try {
    const agents = await User.find({ role: 'admin' }).select('-passwordHash');
    res.json(agents);
  } catch (err) {
    res.status(500).json({ message: "Fetch failed", error: err.message });
  }
};

// Verify an agent
exports.verifyAgent = async (req, res) => {
  try {
    const agent = await User.findById(req.params.agentId);
    if (!agent || agent.role !== 'admin') return res.status(404).json({ message: 'Agent not found' });
    agent.verified = true;
    await agent.save();
    res.json({ message: "Agent verified", agent });
  } catch (err) {
    res.status(500).json({ message: "Verification failed", error: err.message });
  }
};

// Block/Unblock agent
exports.toggleBlockAgent = async (req, res) => {
  try {
    const agent = await User.findById(req.params.agentId);

    console.log("agentagentagentagentagent" ,agent);
    
    if (!agent || agent.role !== 'admin') return res.status(404).json({ message: 'Agent not found' });
    agent.blocked = !agent.blocked;
    await agent.save();
    res.json({ message: `Agent ${agent.blocked ? "blocked" : "unblocked"}`, agent });
  } catch (err) {
    res.status(500).json({ message: "Action failed", error: err.message });
  }
};


// Soft delete (deactivate) admin
exports.softDeleteAgent = async (req, res) => {
  try {
    const agent = await User.findById(req.params.agentId);
    if (!agent || agent.role !== 'admin')
      return res.status(404).json({ message: "Agent not found" });

    // Mark as deleted / inactive instead of removing document
    agent.deleted = true;  // Make sure this field exists in your User schema with default false
    agent.blocked = true;  // Optional: block the user as well upon deactivation
    await agent.save();

    res.json({ message: "Agent deactivated (soft deleted)", agent });
  } catch (err) {
    res.status(500).json({ message: "Deletion failed", error: err.message });
  }
};

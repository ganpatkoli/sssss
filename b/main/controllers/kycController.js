// File upload logic must use multer (or cloud function)—here we assume client sends URLs:
const User = require("../models/User");

exports.submitKYC = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Only agents can submit KYC" });

    const idProofUrl = req.files["idProof"][0].path;
    const addressProofUrl = req.files["addressProof"][0].path;
    const licenseUrl = req.files["license"][0].path;

    req.user.kyc = {
      status: "pending",
      idProofUrl,
      addressProofUrl,
      licenseUrl,
      submittedAt: new Date(),
    };
    await req.user.save();

    res.json({
      message: "KYC submitted successfully with files",
      kyc: req.user.kyc,
    });
  } catch (err) {
    res.status(500).json({ message: "KYC submit failed", error: err.message });
  }
};

// Superadmin reviews agent KYC
exports.reviewKYC = async (req, res) => {
  try {
    const agent = await User.findById(req.params.agentId);
    if (!agent || agent.role !== "admin")
      return res.status(404).json({ message: "Agent not found" });

    const { action, adminNote } = req.body; // action = 'approve'|'reject'
    if (!agent.kyc)
      return res.status(400).json({ message: "No KYC submitted" });

    agent.kyc.status = action === "approve" ? "approved" : "rejected";
    agent.kyc.reviewedBy = req.user.id;
    agent.kyc.reviewedAt = new Date();
    agent.kyc.adminNote = adminNote;
    if (action === "approve") agent.verified = true;
    await agent.save();

    res.json({ message: `KYC ${action}d`, agent });
  } catch (err) {
    res.status(500).json({ message: "Review failed", error: err.message });
  }
};

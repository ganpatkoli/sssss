const AuditLog = require("../models/AuditLog");
const { Parser } = require("json2csv");

exports.getAllLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate("actor", "name email role")
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Fetch logs failed", error: err.message });
  }
};

exports.filterLogs = async (req, res) => {
  try {
    const { actorId, action, from, to, keyword, limit } = req.query;
    let filter = {};
    if (actorId) filter.actor = actorId;
    if (action) filter.action = action;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    // Keyword search in 'details' field (if stored as a string key in object)
    if (keyword) filter["details"] = { $regex: keyword, $options: "i" };
    const pageLimit = limit ? parseInt(limit) : 100;
    const logs = await AuditLog.find(filter)
      .populate("actor", "name email role")
      .sort({ createdAt: -1 })
      .limit(pageLimit);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Filter logs failed", error: err.message });
  }
};

exports.exportLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate("actor", "name email role")
      .sort({ createdAt: -1 });
    const fields = [
      "createdAt",
      "actor.name",
      "actor.email",
      "action",
      "details",
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(
      logs.map((l) => ({
        createdAt: l.createdAt,
        "actor.name": l.actor.name,
        "actor.email": l.actor.email,
        action: l.action,
        details: JSON.stringify(l.details),
      }))
    );
    res.header("Content-Type", "text/csv");
    res.attachment("audit_logs.csv");
    return res.send(csv);
  } catch (err) {
    res.status(500).json({ message: "Export failed", error: err.message });
  }
};

const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else {
    return res.status(401).json({ message: "No token, auth denied" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-passwordHash");
    next();
  } catch (err) {
    res.status(401).json({ message: "Token not valid" });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "superadmin") {
    return res.status(403).json({ message: "Admins only" });
  }
  next();
};

exports.superadminOnly = (req, res, next) => {
  if (req.user.role !== "superadmin") {
    return res.status(403).json({ message: "Superadmin access only" });
  }
  next();
};

exports.checkAgentStatus = (req, res, next) => {
  if (req.user && req.user.role === "admin" && req.user.status !== "active") {
    return res.status(403).json({
      message: "Your account is pending approval. Please contact support.",
    });
  }
  next();
};

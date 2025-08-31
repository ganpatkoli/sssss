const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../services/emailService");
const { sendSMS } = require("../services/smsService");
const { sendNotification } = require("./notificationController");

// exports.signup = async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;
//     let user = await User.findOne({ email });
//     if (user) return res.status(400).json({ message: 'Email exists' });
//     const passwordHash = await bcrypt.hash(password, 10);
//     user = new User({ name, email, passwordHash, role });
//     await user.save();
//     res.status(201).json({ message: 'Signup successful' });
//   } catch (err) {
//     res.status(500).json({ message: 'Signup error', error: err.message });
//   }
// };

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      return res.status(400).json({ message: "Invalid credentials" });
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ message: "Login error", error: err.message });
  }
};

// Optional: Referral logic module if used, e.g. loyaltyController.handleReferral

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role, referralCode } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    if (role === "superadmin") {
      return res
        .status(403)
        .json({ message: "Superadmin signup not allowed via API" });
    }

    // Hash password securely
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      passwordHash: passwordHash,
      knowpassword: password,
      role: role || "user",
      verified: false, // Or true depending on your flow
    });

    await newUser.save();

    // Optional: If using referral system, handle it here

    if (referralCode) {
      await someReferralHandler(newUser._id, referralCode);
    }

    // controllers/authController.js - login method
    if (role === "superadmin") {
      await sendEmail(
        role.email,
        "Superadmin Login Alert",
        "Someone just logged in as superadmin. If this was not you, investigate immediately!",
        "<b>Alert:</b> Your superadmin account was accessed."
      );
    }

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error during signup" });
  }
};

// Agent self registration
exports.registerAgent = async (req, res) => {
  try {
    const { name, email, password, phone, region } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const agent = new User({
      name,
      email,
      passwordHash: hashedPassword,
      knowpassword: password,
      phone,
      region,
      role: "admin", // Agent role
      verified: false,
      status: "pending", // Waiting for superadmin approval
    });

    await agent.save();

    res.status(201).json({
      message: "Agent registration successful. Waiting for approval.",
      agentId: agent._id,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Registration failed", error: error.message });
  }
};

// Superadmin approve/reject agent
exports.approveAgent = async (req, res) => {
  try {
    const { action } = req.body;

    const agent = await User.findById(req.params.agentId);
    if (!agent || agent.role !== "admin") {
      return res.status(404).json({ message: "Agent not found" });
    }

    if (action === "approve") {
      agent.verified = true;
      agent.status = "active";
      await agent.save();

      await sendNotification(
        agent._id,
        "Account Approved",
        "Your agent account has been approved. You can now start creating trips.",
        "/dashboard"
      );

      res.json({ message: "Agent approved successfully", agent });
    } else if (action === "reject") {
      await User.findByIdAndDelete(req.params.agentId);
      res.json({ message: "Agent registration rejected" });
    }
  } catch (error) {
    res.status(500).json({ message: "Action failed", error: error.message });
  }
};

// Get pending agents (for superadmin)
exports.getPendingAgents = async (req, res) => {
  try {
    const pendingAgents = await User.find({
      role: "admin",
      status: "pending",
    }).select("-password");

    res.json(pendingAgents);
  } catch (error) {
    res.status(500).json({ message: "Fetch failed", error: error.message });
  }
};

// Get profile by ID (for superadmin)
exports.getProfile = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(id).select("-passwordHash -knowpassword");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Fetch failed", error: error.message });
  }
};

// Google login

exports.googleLogin = async (req, res) => {
  const { googleId, email, name, photoUrl } = req.body;

  if (!googleId || !email) {
    return res.status(400).json({ message: "Google ID and email required" });
  }

  try {
    let user = await User.findOne({ googleId });

    if (!user) {
      user = new User({
        googleId,
        email,
        name,
        photo: photoUrl,
        role: "user",
        blocked: false,
        deleted: false,
      });

      await user.save();
    }

    // JWT बनाएं
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user });
  } catch (err) {
    console.error("Google login error:", err);
    res
      .status(500)
      .json({ message: "Google login failed", error: err.message });
  }
};

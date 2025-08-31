const express = require("express");
const {
  signup,
  login,
  getPendingAgents,
  approveAgent,
  registerAgent,
  getProfile,
  googleLogin
} = require("../controllers/authController");
const router = express.Router();
const { protect, superadminOnly } = require("../middleware/authMiddleware");

router.post("/signup", signup);
router.post("/login", login);

// Agent self registration (public route)
router.post("/register-agent", registerAgent);

// Superadmin routes
router.get("/pending-agents", protect, superadminOnly, getPendingAgents);

router.get("/me/:id",   getProfile);

router.put("/approve-agent/:agentId", protect, superadminOnly, approveAgent);

// social login routes

router.post("/google-login", googleLogin);

module.exports = router;

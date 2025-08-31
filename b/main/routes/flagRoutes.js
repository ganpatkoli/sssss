const express = require("express");
const {
  createFlag,
  getAllFlags,
  resolveFlag,
} = require("../controllers/flagController");
const { protect, superadminOnly } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", protect, createFlag); // Any user flags
router.get("/", protect, superadminOnly, getAllFlags); // Superadmin views all
router.patch("/:flagId/resolve", protect, superadminOnly, resolveFlag); // Superadmin resolves

module.exports = router;

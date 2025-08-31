const express = require("express");
const { submitKYC, reviewKYC } = require("../controllers/kycController");
const { protect, superadminOnly } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const router = express.Router();

// Upload 3 files: idProof, addressProof, license
router.post(
  "/submit",
  protect,
  upload.fields([
    { name: "idProof", maxCount: 1 },
    { name: "addressProof", maxCount: 1 },
    { name: "license", maxCount: 1 },
  ]),
  submitKYC
);

// router.post('/submit', protect, submitKYC); // Agent submits documents
router.patch("/review/:agentId", protect, superadminOnly, reviewKYC); // Superadmin reviews

module.exports = router;

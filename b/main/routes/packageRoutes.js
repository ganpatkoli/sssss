const express = require("express");
const {
  protect,
  superadminOnly,
  adminOnly,
} = require("../middleware/authMiddleware");
const {
  createPackage,
  updatePackage,
  sendPackageInvoice,
  deletePackage,
  listPackages,
  assignPackage,
} = require("../controllers/packageController");
const router = express.Router();

router.post("/", protect, superadminOnly, createPackage);
router.put("/:id", protect, superadminOnly, updatePackage);
router.delete("/:id", protect, superadminOnly, deletePackage);
router.get("/", protect, adminOnly, listPackages);
router.post("/assign", protect, superadminOnly, assignPackage);
router.get(
  "/:userId/invoice/:historyEntryId",
  protect,
  superadminOnly,
  sendPackageInvoice
);

module.exports = router;

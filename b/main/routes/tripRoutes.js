const express = require('express');
const {
  createTrip,
  getAllTrips,
  getTripById,
  getTripsByAgent,
  updateTrip,
  deleteTrip,
} = require('../controllers/tripController');
const { protect, adminOnly } = require('../middleware/authMiddleware'); // auth & role middleware
const upload = require("../middleware/upload");

const router = express.Router();

// ✅ Get all published trips
router.get('/', getAllTrips);

// ✅ Get trip by ID
router.get('/:id', getTripById);

// ✅ Get trips by agent (protected)
router.get("/agent/:agentId", protect, getTripsByAgent);

// ✅ Create trip (protected + admin)
router.post(
  "/",
  protect,
  adminOnly,
  upload.array("images", 8), // max 8 images
  createTrip
);

// ✅ Update trip by ID (protected + admin)
router.put(
  "/:id",
  protect,
  adminOnly,
  upload.array("images", 8),
  updateTrip
);

// ✅ Delete trip by ID (protected + admin)
router.delete("/:id", protect, adminOnly, deleteTrip);




module.exports = router;



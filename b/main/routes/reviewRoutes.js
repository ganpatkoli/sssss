const express = require('express');
const { createReview, getTripReviews, getUserReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, createReview);                // User submits review
router.get('/trip/:tripId', getTripReviews);            // All reviews for a trip
router.get('/my', protect, getUserReviews);             // All reviews by this user

module.exports = router;

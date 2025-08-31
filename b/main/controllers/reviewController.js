const Review = require('../models/Review');

// User gives review for a trip
exports.createReview = async (req, res) => {
  try {
    const { tripId, rating, comment } = req.body;
    // Prevent duplicate review
    const exists = await Review.findOne({ tripId, userId: req.user.id });
    if (exists) return res.status(400).json({ message: 'Already reviewed' });

    const newReview = new Review({
      tripId,
      userId: req.user.id,
      rating,
      comment
    });
    await newReview.save();
    res.status(201).json(newReview);
  } catch (err) {
    res.status(500).json({ message: 'Review failed', error: err.message });
  }
};

// Get all reviews for a trip
exports.getTripReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ tripId: req.params.tripId }).populate('userId', 'name');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Fetch failed', error: err.message });
  }
};

// Get all reviews by a user (user profile)
exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user.id }).populate('tripId', 'title');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Fetch failed', error: err.message });
  }
};

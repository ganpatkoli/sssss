// controllers/searchController.js
const Trip = require('../models/Trip');

// Geo-search trips near given lat/lng
exports.getNearbyTrips = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: "Latitude and longitude are required." });

    const trips = await Trip.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radius ? Number(radius) : 50000 // meters (default: 50km)
        }
      }
    });

    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: 'Geo-search failed', error: err.message });
  }
};


// controllers/searchController.js
exports.combinedTripSearch = async (req, res) => {
  try {
    const { lat, lng, radius, minPrice, maxPrice, startDate, endDate, keyword } = req.query;
    let filter = { status: 'published' };
    if (minPrice || maxPrice) filter.pricePerPerson = {};
    if (minPrice) filter.pricePerPerson.$gte = Number(minPrice);
    if (maxPrice) filter.pricePerPerson.$lte = Number(maxPrice);
    if (startDate) filter.startDate = { $gte: new Date(startDate) };
    if (endDate) filter.endDate = { ...filter.endDate, $lte: new Date(endDate) };
    if (keyword) filter.title = { $regex: keyword, $options: 'i' };

    // Location filter add karein (if present)
    if (lat && lng) {
      filter.location = {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: radius ? Number(radius) : 50000
        }
      };
    }

    const trips = await Trip.find(filter).populate('agentId', 'name');
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: 'Combined search failed', error: err.message });
  }
};

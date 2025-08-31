// const express = require('express');
// const { advancedTripSearch } = require('../controllers/searchController');
// const router = express.Router();

// router.get('/trips', advancedTripSearch); // /api/search/trips?from=Indore&minPrice=1000&inclusions=camping,bike

// module.exports = router;



const express = require('express');
const { getNearbyTrips , combinedTripSearch } = require('../controllers/searchController');
const router = express.Router();

router.get('/trips/nearby', getNearbyTrips); 
router.get('/trips/search', combinedTripSearch);

// e.g., /api/search/trips/nearby?lat=22.7&lng=75.9&radius=25000

module.exports = router;

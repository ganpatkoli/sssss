const { ObjectId } = require("mongodb");
const Trip = require("../models/Trip");

// Create new trip
exports.createTrip = async (req, res) => {
  try {
    console.log("📥 Raw Body:", req.body);
    console.log("📸 Files:", req.files);

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "Request body is empty" });
    }

    // Parse JSON strings if sent as strings
    ["location", "route", "inclusions", "title", "description", "price", "pickupPoints", "dropPoints", "guideAvailable", "cancellationPolicy"].forEach((field) => {
      if (req.body[field] && typeof req.body[field] === "string") {
        try {
          req.body[field] = JSON.parse(req.body[field]);
        } catch (err) {
          // If parse fails, leave as is – could be simple string like guideAvailable boolean or cancellationPolicy string
          if (field === "guideAvailable") {
            req.body.guideAvailable = (req.body.guideAvailable === "true" || req.body.guideAvailable === true);
          }
        }
      }
    });


    const {
      title,
      description,
      route,
      inclusions,
      price,
      startDate,
      endDate,
      availableSeats,
      totalSeats,
      location,
      status,
      pickupPoints,
      dropPoints,
      guideAvailable,
      cancellationPolicy,
    } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({ error: "Title & Description required" });
    }

    // Validate price object keys presence
    if (!price || typeof price !== "object" || (!price.single && !price.couple && !price.group)) {
      return res.status(400).json({ error: "Price object with at least one of 'single', 'couple', or 'group' required" });
    }

    const trip = await Trip.create({
      agentId: req.user._id,
      title,
      description,
      route,
      inclusions,
      price,
      startDate,
      endDate,
      availableSeats,
      totalSeats,
      location,
      status,
      pickupPoints,
      dropPoints,
      guideAvailable,
      cancellationPolicy,
      images: req.files ? req.files.map((f) => f.path) : [],
    });

    res.status(201).json({
      success: true,
      message: "Trip created successfully",
      data:trip,
    });
  } catch (err) {
    console.error("❌ Trip creation failed:", err);
    res.status(500).json({ error: err.message, message: "Trip creation failed" });
  }
};

// Get all published trips
exports.getAllTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ status: "published" }).populate("agentId", "name email") .sort({ createdAt: -1 })

    if (!trips.length) {
      return res.status(200).json({
        message: "No published trips found",
      });
    }

     res.status(200).json({
      message: "Published trips fetched successfully",
      trips,
    });
  } catch (err) {
    console.error("❌ Fetch trips failed:", err);
     res.status(500).json({
      message: "Failed to fetch trips",
      error: err.message,
    });
  }
};

// Get trip by ID with language support
exports.getTripById = async (req, res) => {
  try {
    const lang = req.user?.preferredLanguage || req.query.lang || "en";

    const trip = await Trip.findById(req.params.id).populate("agentId", "name email");

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found",
      });
    }

    const response = trip.toObject();
    if (typeof trip.title === "object") {
      response.title = trip.title[lang] || trip.title["en"] || "";
    }
    if (typeof trip.description === "object") {
      response.description = trip.description[lang] || trip.description["en"] || "";
    }

    return res.status(200).json({
      message: "Trip fetched successfully",
      trip: response,
    });
  } catch (err) {
    console.error("❌ Fetch trip failed:", err);
    return res.status(500).json({
      message: "Failed to fetch trip",
      error: err.message,
    });
  }
};

// Get trips by agent ID
exports.getTripsByAgent = async (req, res) => {
  try {
    const agentId = req.params.agentId;

    const trips = await Trip.find({ agentId })
      .sort({ createdAt: -1 })
      .populate("agentId", "name email");

    if (!trips.length) {
      return res.status(404).json({ message: "No trips found for this agent." });
    }

    return res.json({ trips });
  } catch (err) {
    return res.status(500).json({ message: "Failed to get trips", error: err.message });
  }
};

// Update trip by ID
// exports.updateTrip = async (req, res) => {
//   try {
//     const tripId = req.params.id;

//     if (!ObjectId.isValid(tripId)) {
//       return res.status(400).json({ message: "Invalid Trip ID" });
//     }

//     ["location", "route", "inclusions", "title", "description", "price", "pickupPoints", "dropPoints", "guideAvailable", "cancellationPolicy"].forEach((field) => {
//       if (req.body[field] && typeof req.body[field] === "string") {
//         try {
//           req.body[field] = JSON.parse(req.body[field]);
//         } catch (err) {
//           if (field === "guideAvailable") {
//             req.body.guideAvailable = (req.body.guideAvailable === "true" || req.body.guideAvailable === true);
//           }
//         }
//       }
//     });

//     if (req.files && req.files.length) {
//       req.body.images = req.files.map((f) => f.path);
//     }

//     const updatedTrip = await Trip.findByIdAndUpdate(tripId, req.body, {
//       new: true,
//       runValidators: true,
//     });

//     if (!updatedTrip) {
//       return res.status(404).json({ message: "Trip not found" });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Trip updated successfully",
//       trip: updatedTrip,
//     });
//   } catch (err) {
//     console.error("❌ Update trip failed:", err);
//     return res.status(500).json({ message: "Failed to update trip", error: err.message });
//   }
// };

exports.updateTrip = async (req, res) => {
  try {
    const tripId = req.params.id;

    if (!ObjectId.isValid(tripId)) {
      return res.status(400).json({ message: "Invalid Trip ID" });
    }

    // Parse JSON fields if received as strings
    [
      "location",
      "route",
      "inclusions",
      "title",
      "description",
      "price",
      "pickupPoints",
      "dropPoints",
      "guideAvailable",
      "cancellationPolicy",
      "existingImages"  // नया फील्ड - पुरानी images के लिए
    ].forEach((field) => {
      if (req.body[field] && typeof req.body[field] === "string") {
        try {
          req.body[field] = JSON.parse(req.body[field]);
        } catch (err) {
          if (field === "guideAvailable") {
            req.body.guideAvailable = req.body.guideAvailable === "true" || req.body.guideAvailable === true;
          }
        }
      }
    });

    // पुरानी images JSON से प्राप्त करें, यदि नहीं मिले तो खाली array रखें
    const existingImages = Array.isArray(req.body.existingImages) ? req.body.existingImages : [];

    // नई images के paths (multer upload से)
    const newImagesPaths = req.files ? req.files.map((f) => f.path) : [];

    // पुरानी और नई images को मिलाएं
    req.body.images = [...existingImages, ...newImagesPaths];

    // अब ट्रिप अपडेट करें
    const updatedTrip = await Trip.findByIdAndUpdate(tripId, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedTrip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Trip updated successfully",
      data: updatedTrip,
    });
  } catch (err) {
    console.error("❌ Update trip failed:", err);
    return res.status(500).json({ message: "Failed to update trip", error: err.message });
  }
};


// Delete trip by ID
exports.deleteTrip = async (req, res) => {
  try {
    const tripId = req.params.id;

    if (!ObjectId.isValid(tripId)) {
      return res.status(400).json({ message: "Invalid Trip ID" });
    }

    const deletedTrip = await Trip.findByIdAndDelete(tripId);

    if (!deletedTrip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Trip deleted successfully",
      trip: deletedTrip,
    });
  } catch (err) {
    console.error("❌ Delete trip failed:", err);
    return res.status(500).json({ message: "Failed to delete trip", error: err.message });
  }
};

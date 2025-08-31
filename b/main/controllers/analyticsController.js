const Trip = require('../models/Trip');
const Booking = require('../models/Booking');
const User = require('../models/User');

// Superadmin summary analytics (platform-wide)
exports.getPlatformStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAgents = await User.countDocuments({ role: 'admin' });
    const totalTrips = await Trip.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const revenue = await Booking.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: "$pricePaid" } } }
    ]);
    res.json({
      totalUsers,
      totalAgents,
      totalTrips,
      totalBookings,
      totalRevenue: revenue[0]?.totalRevenue || 0
    });
  } catch (err) {
    res.status(500).json({ message: 'Stats fetch failed', error: err.message });
  }
};

// Agent (Admin) dashboard stats
exports.getAgentStats = async (req, res) => {
  try {
    const totalTrips = await Trip.countDocuments({ agentId: req.user.id });
    const myTrips = await Trip.find({ agentId: req.user.id }).select('_id');
    const tripIds = myTrips.map(t => t._id);

    const totalBookings = await Booking.countDocuments({ tripId: { $in: tripIds } });
    const revenue = await Booking.aggregate([
      { $match: { tripId: { $in: tripIds }, paymentStatus: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: "$pricePaid" } } }
    ]);
    res.json({
      totalTrips,
      totalBookings,
      totalRevenue: revenue[0]?.totalRevenue || 0
    });
  } catch (err) {
    res.status(500).json({ message: 'Agent stats failed', error: err.message });
  }
};



exports.monthlyBookingsByAgent = async (req, res) => {
  try {
    const aggregation = await Booking.aggregate([
      {
        $match: { status: "active" }
      },
      {
        $group: {
          _id: { 
            agentId: "$agentId", 
            month: { $month: "$createdAt" }, 
            year: { $year: "$createdAt" } 
          },
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: "$pricePaid" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id.agentId",
          foreignField: "_id",
          as: "agent"
        }
      },
      {
        $unwind: "$agent"
      },
      {
        $project: {
          agentName: "$agent.name",
          agentEmail: "$agent.email",
          month: "$_id.month",
          year: "$_id.year",
          totalBookings: 1,
          totalRevenue: 1
        }
      },
      {
        $sort: { year: -1, month: -1 }
      }
    ]);
    res.json(aggregation);
  } catch (err) {
    res.status(500).json({ message: "Aggregation failed", error: err.message });
  }
};



exports.monthlyStats = async (req, res) => {
  try {
    const data = await Booking.aggregate([
      {
        $match: { paymentStatus: "completed" }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: "$pricePaid" }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } }
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Analytics error', error: err.message });
  }
};


exports.agentLeaderboard = async (req, res) => {
  try {
    const data = await Booking.aggregate([
      { $match: { paymentStatus: "completed" } },
      { $group: {
          _id: "$tripId",
          bookingCount: { $sum: 1 },
          revenue: { $sum: "$pricePaid" }
        } 
      },
      { $lookup: {
          from: 'trips',
          localField: '_id',
          foreignField: '_id',
          as: 'trip'
        }
      },
      { $unwind: "$trip" },
      { $group: {
          _id: "$trip.agentId",
          totalBookings: { $sum: "$bookingCount" },
          totalRevenue: { $sum: "$revenue" }
        }
      },
      { $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'agent'
        }
      },
      { $unwind: "$agent" },
      { $project: {
          agentId: "$agent._id",
          agentName: "$agent.name",
          totalBookings: 1,
          totalRevenue: 1
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Leaderboard error", error: err.message });
  }
};


// Booking + User join for package analytics
exports.bookingsByPackage = async (req, res) => {
  try {
    const data = await Booking.aggregate([
      { $match: { paymentStatus: "completed" } },
      { $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: "$user" },
      { $group: {
          _id: "$user.packageId",
          count: { $sum: 1 }
        }
      },
      { $lookup: {
          from: 'packages',
          localField: '_id',
          foreignField: '_id',
          as: 'package'
        }
      },
      { $unwind: "$package" },
      { $project: {
          packageName: "$package.name",
          bookings: "$count"
        }
      }
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Analytics error", error: err.message });
  }
};

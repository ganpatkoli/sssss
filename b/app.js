const express = require("express");
const cors = require("cors");
const { swaggerUi, specs } = require("./main/config/swagger");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");

require("dotenv").config();
require("./main/cron/autoJobs");
require("./main/cron/packageExpiryNotifier");
require("./main/cron/packageAutoExpire");
require("./main/cron/autoBookingComplete");
require("./main/cron/autoCancel");
require("./main/cron/tripReminder");


const connectDB = require("./main/config/db");

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/kyc", require("./main/routes/kycRoutes"));
app.use("/api/auth", require("./main/routes/authRoutes"));
app.use("/api/trips", require("./main/routes/tripRoutes"));
app.use("/api/bookings", require("./main/routes/bookingRoutes"));
app.use("/api/reviews", require("./main/routes/reviewRoutes"));
app.use("/api/notifications", require("./main/routes/notificationRoutes"));
app.use("/api/chats", require("./main/routes/chatRoutes"));
app.use("/api/analytics", require("./main/routes/analyticsRoutes"));
app.use("/api/payments", require("./main/routes/paymentRoutes"));
app.use("/api/admin", require("./main/routes/adminRoutes"));
app.use("/api/flags", require("./main/routes/flagRoutes"));
app.use("/api/search", require("./main/routes/searchRoutes"));
app.use("/api/loyalty", require("./main/routes/loyaltyRoutes"));
app.use("/api/audit", require("./main/routes/auditRoutes"));
app.use("/api/packages", require("./main/routes/packageRoutes"));

// Swagger docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Root
app.get("/", (req, res) => res.send("API Running!"));

module.exports = app;

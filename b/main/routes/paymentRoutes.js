const express = require("express");
const { completePayment, razorpayWebhookHandler } = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");
const bodyParser = require("body-parser");

const router = express.Router();

router.post("/complete", protect, completePayment);

// router.post(
//   "/webhook/razorpay",
//   bodyParser.raw({ type: "application/json" }),
//   razorpayWebhookHandler
// );

module.exports = router;

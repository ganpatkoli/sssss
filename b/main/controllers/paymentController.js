// const { markBookingPaid } = require("../services/paymentService");
// const { sendNotification } = require("./notificationController");
// const Booking = require("../models/Booking");

// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// exports.completePayment = async (req, res) => {
//   try {
//     const { bookingId, amount } = req.body;
//     // Normally payment verification from Payment Gateway Callback here
//     const booking = await markBookingPaid(bookingId, amount);
//     res.json({ message: "Payment successful!", booking });
//   } catch (err) {
//     res.status(400).json({ message: "Payment failed", error: err.message });
//   }
// };

// exports.stripeWebhook = async (req, res) => {
//   const sig = req.headers["stripe-signature"];
//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(
//       req.rawBody,
//       sig,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );
//   } catch (err) {
//     console.log("Webhook signature verification failed.", err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   // Handle the event
//   switch (event.type) {
//     case "payment_intent.succeeded":
//       const paymentIntent = event.data.object;

//       // Find booking by payment reference and update status
//       const booking = await Booking.findOne({ paymentRef: paymentIntent.id });
//       if (booking) {
//         booking.paymentStatus = "completed";
//         booking.status = "active";
//         await booking.save();

//         // Notify user about payment success
//         await sendNotification(
//           booking.userId,
//           "Payment Successful",
//           `Your booking for trip ${booking.tripId} is confirmed!`,
//           `/booking/${booking._id}`
//         );
//       }
//       break;

//     case "payment_intent.payment_failed":
//       const failedIntent = event.data.object;
//       const failedBooking = await Booking.findOne({
//         paymentRef: failedIntent.id,
//       });
//       if (failedBooking) {
//         failedBooking.paymentStatus = "failed";
//         await failedBooking.save();
//         // Optional: notification or cleanup
//       }
//       break;

//     // ... handle other event types as needed

//     default:
//       console.log(`Unhandled event type ${event.type}`);
//   }

//   res.json({ received: true });
// };

// // Stripe webhook entry point
// exports.paymentWebhook = async (req, res) => {
//   const sig = req.headers["stripe-signature"];
//   let event;

//   try {
//     // req.rawBody hona zaruri hai (see app.js/postman config), vrna error aaega
//     event = stripe.webhooks.constructEvent(
//       req.rawBody,
//       sig,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );
//   } catch (err) {
//     console.error("Webhook signature verification failed:", err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   try {
//     switch (event.type) {
//       case "payment_intent.succeeded": {
//         const payment = event.data.object;
//         // Find booking by Stripe payment ID
//         const booking = await Booking.findOne({ paymentRef: payment.id });
//         if (!booking) break; // Unknown payment, ignore

//         booking.paymentStatus = "completed";
//         booking.status = "active";
//         await booking.save();

//         // User/agent ko notification bhejein
//         await sendNotification(
//           booking.userId,
//           "Payment successful",
//           `Your booking for trip has been confirmed!`,
//           `/booking/${booking._id}`
//         );
//         break;
//       }

//       case "payment_intent.payment_failed": {
//         const payment = event.data.object;
//         const booking = await Booking.findOne({ paymentRef: payment.id });
//         if (!booking) break;

//         booking.paymentStatus = "cancelled";
//         booking.status = "cancelled";
//         await booking.save();

//         await sendNotification(
//           booking.userId,
//           "Payment failed",
//           "Your booking could not be completed due to payment failure.",
//           `/booking/${booking._id}`
//         );
//         break;
//       }
//       // Handle other Stripe events as needed
//       default:
//         console.log(`Unhandled event type ${event.type}`);
//     }
//     res.json({ received: true });
//   } catch (error) {
//     console.error("Webhook booking error:", error);
//     res.status(500).json({ message: "Webhook internal error" });
//   }
// };










const crypto = require("crypto");
const Booking = require("../models/Booking");
const { sendNotification } = require("./notificationController");

// Razorpay webhook handler
exports.razorpayWebhook = async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET; // Razorpay वेबहुक सीक्रेट
  const signature = req.headers["x-razorpay-signature"];
  const payload = JSON.stringify(req.body);

  // Signature verify करें
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(payload)
    .digest("hex");

  if (signature !== expectedSignature) {
    console.log("Razorpay webhook signature mismatch");
    return res.status(400).send("Invalid signature");
  }

  const event = req.body;

  try {
    switch (event.event) {
      case "payment.captured":
        const payment = event.payload.payment.entity;
        // payment.entity.id Razorpay payment ID

        // Booking को paymentRef से खोजें
        const booking = await Booking.findOne({ paymentRef: payment.id });
        if (!booking) {
          console.log("Booking not found for payment:", payment.id);
          break;
        }

        booking.paymentStatus = "completed";
        booking.status = "active";
        await booking.save();

        await sendNotification(
          booking.userId,
          "Payment Successful",
          `Your booking for trip "${booking.tripId}" is confirmed!`,
          `/booking/${booking._id}`
        );
        break;

      case "payment.failed":
        const failedPayment = event.payload.payment.entity;
        const failedBooking = await Booking.findOne({ paymentRef: failedPayment.id });
        if (failedBooking) {
          failedBooking.paymentStatus = "cancelled";
          failedBooking.status = "cancelled";
          await failedBooking.save();

          await sendNotification(
            failedBooking.userId,
            "Payment Failed",
            "Your booking payment failed. Please try again.",
            `/booking/${failedBooking._id}`
          );
        }
        break;

      // Razorpay के अन्य events हैंडल करें जैसे refund, authorized etc.

      default:
        console.log(`Unhandled Razorpay event: ${event.event}`);
    }

    res.json({ status: "ok" });
  } catch (err) {
    console.error("Error processing Razorpay webhook:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



exports.completePayment = async (req, res) => {
  try {
    const { bookingId, paymentId, amount } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // paymentId (Razorpay Payment ID) को paymentRef में सेट करें ताकि वेबहुक में मिल जाए
    booking.paymentRef = paymentId;
    booking.pricePaid = amount;
    booking.paymentStatus = "pending"; // Payment webhook तक pending रखें
    await booking.save();

    res.json({ message: "Payment initiation successful", booking });
  } catch (error) {
    res.status(500).json({ message: "Internal error", error: error.message });
  }
};

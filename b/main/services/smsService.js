const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendSMS(to, body) {
  return client.messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER,
    to
  });
}

module.exports = { sendSMS };



// // After booking confirm
// await sendEmail(user.email, "Booking Confirmed", "Your trip is booked!", "<p>Trip details...</p>");
// await sendSMS(user.phone, `Your booking for trip "${trip.title}" is confirmed!`);


// const { sendEmail } = require('../services/emailService');
// const { sendSMS } = require('../services/smsService');

// exports.registerUser = async (req, res) => {
//   // ...normal signup logic...
//   // Generate OTP/code, save in DB (user.verificationToken)
//   await sendEmail(user.email, "Verify your account", "Welcome!", `<b>Click to verify</b>`);
//   await sendSMS(user.phone, "Your verification code: 123456");
//   res.json({ message: "Signup complete, verification sent!" });
// };

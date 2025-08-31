const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail(to, subject, text, html) {
  const msg = {
    to,
    from: process.env.EMAIL_FROM, // Verified sender email
    subject,
    text,
    html
  };
  await sgMail.send(msg);
}

module.exports = { sendEmail };

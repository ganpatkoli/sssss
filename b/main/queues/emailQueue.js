const Queue = require('bull');
const { sendEmail } = require('../services/emailService');

const emailQueue = new Queue('email-task', process.env.REDIS_URL);

emailQueue.process(async (job) => {
  const { to, subject, text, html } = job.data;
  await sendEmail(to, subject, text, html);
});

async function addEmailTask(to, subject, text, html) {
  await emailQueue.add({ to, subject, text, html });
}

module.exports = { addEmailTask };

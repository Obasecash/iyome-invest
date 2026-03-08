const { sendMail } = require("../utils/email");

async function notifyEmail(to, subject, message) {
  try {
    if (!to) return;
    await sendMail(to, subject, message);
  } catch (e) {
    console.log("Email notify error:", e.message);
  }
}

module.exports = { notifyEmail };
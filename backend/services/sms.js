// Optional: Twilio (put keys in .env)
const twilio = require("twilio");

const client = process.env.TWILIO_SID
  ? twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH)
  : null;

async function sendSMS(to, body) {
  try {
    if (!client) return;
    await client.messages.create({
      to,
      from: process.env.TWILIO_PHONE,
      body,
    });
  } catch (e) {
    console.log("SMS error:", e.message);
  }
}

module.exports = { sendSMS };
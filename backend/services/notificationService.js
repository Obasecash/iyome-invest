import nodemailer from "nodemailer";
import twilio from "twilio";

// ========= EMAIL SETUP =========
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ========= SEND EMAIL =========
export const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
    });
    console.log(`📧 Email sent to ${to}`);
  } catch (err) {
    console.error("❌ Email sending failed:", err.message);
  }
};

// ========= SMS SETUP =========
// (Only if you want SMS via Twilio or MTN Gateway)
const smsClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

export const sendSMS = async (to, message) => {
  try {
    await smsClient.messages.create({
      from: process.env.TWILIO_PHONE,
      to,
      body: message,
    });
    console.log(`📱 SMS sent to ${to}`);
  } catch (err) {
    console.error("❌ SMS sending failed:", err.message);
  }
};

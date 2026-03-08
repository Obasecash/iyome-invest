const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.MAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function sendEmail(to, subject, html) {
  if (!process.env.MAIL_USER) {
    console.warn("MAIL_USER not set, skipping email");
    return;
  }
  await transporter.sendMail({
    from: `"Iyome Invest" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html,
  });
}

module.exports = { sendEmail };




const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendMail = async (to, subject, text) => {
  await transporter.sendMail({
    from: `"IyomeInvest" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: `
      <div style="font-family:Arial;background:#0b0f1a;padding:30px;color:white;">
        <div style="max-width:600px;margin:auto;background:#111827;padding:30px;border-radius:10px;border:1px solid gold;">
          <h2 style="color:gold;margin:0 0 10px;">IyomeInvest</h2>
          <p style="line-height:1.6">${text}</p>
          <hr style="border-color:rgba(255,215,0,0.4);margin:18px 0;">
          <small>© ${new Date().getFullYear()} IyomeInvest • iyomeinvestp.com</small>
        </div>
      </div>
    `,
  });
};
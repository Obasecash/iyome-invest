const pdfPath = await generateReceiptPDF({
  type: "deposit",
  investorId,
  name,
  amount,
  currency,
  externalId,
  financialId,
});

await transporter.sendMail({
  from: process.env.EMAIL_FROM,
  to,
  subject: `Iyome Invest — Deposit SUCCESS (${externalId})`,
  html,
  attachments: [
    { filename: `Iyome_${type}_Receipt_${investorId}.pdf`, path: pdfPath },
  ],
});

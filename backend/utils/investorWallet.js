// backend/utils/investorWallet.js
const Investment = require("../models/investmentModel"); // your existing investment model

// ✅ Add amount to investor total
async function creditInvestor(investorId, amount) {
  const investor = await Investment.findOne({ investorId });
  if (!investor) return;
  investor.totalInvested = (investor.totalInvested || 0) + Number(amount);
  await investor.save();
  console.log(`💰 Credited ${amount} XAF to ${investorId}`);
}

// ✅ Subtract amount from investor total (withdrawal)
async function debitInvestor(investorId, amount) {
  const investor = await Investment.findOne({ investorId });
  if (!investor) return;
  investor.totalWithdrawn = (investor.totalWithdrawn || 0) + Number(amount);
  await investor.save();
  console.log(`💸 Debited ${amount} XAF from ${investorId}`);
}

module.exports = { creditInvestor, debitInvestor };

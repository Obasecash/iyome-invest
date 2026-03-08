const Investment = require("../models/Investment");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

async function processProfits() {
  console.log("Checking investments for payouts...");

  const investments = await Investment.find({
    status: "active",
    profitPaid: false,
    endDate: { $lte: new Date() }
  });

  for (let inv of investments) {
    const user = await User.findById(inv.user);

    if (!user) continue;

    // Credit user wallet with expected return
    user.walletBalance += inv.expectedReturn;
    await user.save();

    // Mark investment as completed
    inv.status = "completed";
    inv.profitPaid = true;
    await inv.save();

    // Save transaction
    await Transaction.create({
      user: user._id,
      type: "profit",
      amount: inv.expectedReturn,
      method: inv.plan,
      status: "success",
      description: `Profit paid for ${inv.plan} plan`
    });

    console.log(`Profit paid: ${user.email} — Amount: ${inv.expectedReturn}`);
  }
}

module.exports = processProfits;

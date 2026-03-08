const Investment = require("../models/Investment");

async function runMaturityCheck() {
  try {
    const now = new Date();

    const investments = await Investment.find({
      status: "active",
      maturityDate: { $lte: now }
    });

    for (let inv of investments) {
      inv.status = "matured";
      await inv.save();
    }

    if (investments.length > 0) {
      console.log(`✅ ${investments.length} investment(s) matured`);
    }
  } catch (err) {
    console.error("❌ Maturity job error:", err.message);
  }
}

module.exports = runMaturityCheck;

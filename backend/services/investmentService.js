const Investment = require("../models/Investment");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Plan = require("../models/Plan");

// SIMPLE interest
function calcSimpleReturn(amount, rate, durationDays) {
  const profit = amount * rate;
  return Math.round(amount + profit);
}

// COMPOUND interest
function calcCompoundReturn(amount, rate, durationDays, frequency) {
  // rate = yearly rate (e.g. 0.20 = 20%/year)
  // durationDays = how many days this plan runs
  const daysInYear = 365;
  let n = 1; // times per year
  if (frequency === "daily") n = 365;
  if (frequency === "weekly") n = 52;
  if (frequency === "monthly") n = 12;

  const years = durationDays / daysInYear;
  const A = amount * Math.pow(1 + rate / n, n * years);
  return Math.round(A);
}

module.exports = {
  calcSimpleReturn,
  calcCompoundReturn,
};

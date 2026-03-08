require("dotenv").config();

module.exports = {
  mode: "sandbox",                         // change to "live" when switching to live mode
  currency: "XAF",                         // Default currency Cameroon
  app_id: process.env.PAYUNIT_APP_ID,      // Your PayUnit App ID
  public_key: process.env.PAYUNIT_KEY,     // Your sandbox or live API KEY
  secret_key: process.env.PAYUNIT_SECRET,  // Your API Secret (password)
  merchant_id: process.env.PAYUNIT_MERCHANT, // Your merchant/business ID
  return_url: process.env.PAYUNIT_RETURN_URL || "https://iyomeafrica.com/payment-complete",
  notify_url: process.env.PAYUNIT_NOTIFY_URL || "https://iyomeafrica.com/api/payunit/webhook",
};

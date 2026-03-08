const mongoose = require("mongoose");

const AdminLogSchema = new mongoose.Schema(
  {
    action: String,
    admin: String, // admin email
    details: Object
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminLog", AdminLogSchema);

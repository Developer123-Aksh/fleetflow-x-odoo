const mongoose = require("mongoose");

const DriverSchema = new mongoose.Schema({
  name: String,
  licenseExpiry: Date,
  status: { type: String, default: "on_duty" }
});

module.exports = mongoose.model("Driver", DriverSchema);
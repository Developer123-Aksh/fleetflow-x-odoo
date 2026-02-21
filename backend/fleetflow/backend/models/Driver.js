const mongoose = require("mongoose");

const DriverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  license_number: { type: String, required: true },
  licenseExpiry: { type: Date, required: true },
  licenseCategory: { type: String, default: "standard" },
  duty_status: { type: String, enum: ["on_duty", "on_break", "suspended"], default: "on_duty" },
  safety_score: { type: Number, default: 100, min: 0, max: 100 },
  performance_score: { type: Number, default: 100, min: 0, max: 100 },
  complaints_count: { type: Number, default: 0 },
  tripsCompleted: { type: Number, default: 0 },
  tripsCancelled: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Driver", DriverSchema);
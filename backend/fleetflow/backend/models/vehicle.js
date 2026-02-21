const mongoose = require("mongoose");

const VehicleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  plate: { type: String, required: true, unique: true },
  make: String,
  model: String,
  year: Number,
  type: { type: String, enum: ["truck", "van", "bike"], default: "van" },
  capacity: { type: Number, required: true },
  odometer: { type: Number, default: 0 },
  status: { type: String, enum: ["available", "on_trip", "in_shop", "retired"], default: "available" },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Vehicle", VehicleSchema);
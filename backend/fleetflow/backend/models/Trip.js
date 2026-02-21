const mongoose = require("mongoose");

const TripSchema = new mongoose.Schema({
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", required: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  cargo_weight_kg: { type: Number, required: true },
  estimated_fuel_cost: Number,
  status: { type: String, enum: ["pending", "in_progress", "completed", "cancelled"], default: "pending" },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Trip", TripSchema);
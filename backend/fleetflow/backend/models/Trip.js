const mongoose = require("mongoose");

const TripSchema = new mongoose.Schema({
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" },
  cargo: Number,
  state: { type: String, default: "draft" }
});

module.exports = mongoose.model("Trip", TripSchema);
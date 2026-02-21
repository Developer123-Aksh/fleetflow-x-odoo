const mongoose = require("mongoose");

const VehicleSchema = new mongoose.Schema({
  name: String,
  plate: String,
  capacity: Number,
  odometer: Number,
  status: { type: String, default: "available" }
});

module.exports = mongoose.model("Vehicle", VehicleSchema);
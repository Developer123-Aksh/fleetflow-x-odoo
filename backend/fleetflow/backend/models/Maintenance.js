const mongoose = require("mongoose");

module.exports = mongoose.model("Maintenance", {
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
  note: String,
  date: { type: Date, default: Date.now }
});
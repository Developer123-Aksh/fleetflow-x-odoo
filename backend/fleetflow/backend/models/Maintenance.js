const mongoose = require("mongoose");

const MaintenanceSchema = new mongoose.Schema({
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
  note: { type: String, default: "" },
  date: { type: Date, default: Date.now },
  cost: { type: Number, default: 0 }
});

module.exports = mongoose.model("Maintenance", MaintenanceSchema);
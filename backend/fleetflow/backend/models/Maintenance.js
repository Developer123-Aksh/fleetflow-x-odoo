const mongoose = require("mongoose");

const MaintenanceSchema = new mongoose.Schema({
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
  service_type: { type: String, required: true },
  technician: String,
  date: { type: Date, default: Date.now },
  cost: { type: Number, default: 0 },
  findings: String,
  status: { type: String, enum: ["open", "resolved"], default: "open" },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Maintenance", MaintenanceSchema);
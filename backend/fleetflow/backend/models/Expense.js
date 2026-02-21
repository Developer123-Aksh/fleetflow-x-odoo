const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema({
  trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip" },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" },
  type: { type: String, enum: ["fuel", "repair", "other"], default: "fuel" },
  liters: Number,
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  notes: String,
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Expense", ExpenseSchema);

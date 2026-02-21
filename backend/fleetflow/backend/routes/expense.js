const router = require("express").Router();
const mongoose = require("mongoose");
const Expense = require("../models/Expense");
const Vehicle = require("../models/vehicle");

const validateExpense = async (req, res, next) => {
  const { vehicle, driver, trip, type, amount, liters } = req.body;
  const errors = [];

  if (!vehicle || typeof vehicle !== "string" || vehicle.trim() === "") {
    errors.push("Vehicle is required");
  } else if (!mongoose.Types.ObjectId.isValid(vehicle)) {
    errors.push("Invalid vehicle ID format");
  } else {
    const v = await Vehicle.findById(vehicle);
    if (!v) {
      errors.push("Vehicle not found");
    }
  }

  if (amount === undefined || amount === null || typeof amount !== "number" || amount < 0) {
    errors.push("Amount must be a non-negative number");
  }

  const validTypes = ["fuel", "repair", "other"];
  if (type && !validTypes.includes(type)) {
    errors.push(`Type must be one of: ${validTypes.join(", ")}`);
  }

  if (liters !== undefined && liters !== null && typeof liters !== "number") {
    errors.push("Liters must be a number");
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  next();
};

router.post("/", validateExpense, async (req, res) => {
  try {
    const expense = await Expense.create(req.body);
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { vehicle, driver, type } = req.query;
    const filter = {};
    if (vehicle) filter.vehicle = vehicle;
    if (driver) filter.driver = driver;
    if (type) filter.type = type;

    const expenses = await Expense.find(filter)
      .populate("vehicle", "name plate")
      .populate("driver", "name")
      .sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/summary/:vehicle_id", async (req, res) => {
  try {
    const expenses = await Expense.find({ vehicle: req.params.vehicle_id });
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    res.json({ vehicle_id: req.params.vehicle_id, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate("vehicle")
      .populate("driver")
      .populate("trip");
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }
    res.json({ message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

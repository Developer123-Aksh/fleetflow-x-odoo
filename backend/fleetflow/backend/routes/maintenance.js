const router = require("express").Router();
const Maintenance = require("../models/Maintenance");
const Vehicle = require("../models/vehicle");
const mongoose = require("mongoose");

const validateMaintenance = async (req, res, next) => {
  const { vehicle, note, cost } = req.body;
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

  if (cost !== undefined && cost !== null && typeof cost !== "number") {
    errors.push("Cost must be a number");
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  next();
};

router.post("/", validateMaintenance, async (req, res) => {
  try {
    const m = await Maintenance.create(req.body);
    await Vehicle.findByIdAndUpdate(req.body.vehicle, { status: "in_shop" });
    res.status(201).json(m);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const maintenance = await Maintenance.find().populate("vehicle");
    res.json(maintenance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const m = await Maintenance.findById(req.params.id).populate("vehicle");
    if (!m) {
      return res.status(404).json({ error: "Maintenance record not found" });
    }
    res.json(m);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const m = await Maintenance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!m) {
      return res.status(404).json({ error: "Maintenance record not found" });
    }
    res.json(m);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const m = await Maintenance.findByIdAndDelete(req.params.id);
    if (!m) {
      return res.status(404).json({ error: "Maintenance record not found" });
    }
    await Vehicle.findByIdAndUpdate(m.vehicle, { status: "available" });
    res.json({ message: "Maintenance record deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
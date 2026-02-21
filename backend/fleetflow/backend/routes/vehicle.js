const router = require("express").Router();
const Vehicle = require("../models/vehicle");

const validateVehicle = (req, res, next) => {
  const { name, plate, capacity, odometer } = req.body;
  const errors = [];

  if (!name || typeof name !== "string" || name.trim() === "") {
    errors.push("Name is required");
  }
  if (!plate || typeof plate !== "string" || plate.trim() === "") {
    errors.push("License plate is required");
  }
  if (capacity === undefined || capacity === null || typeof capacity !== "number" || capacity <= 0) {
    errors.push("Capacity must be a positive number");
  }
  if (odometer !== undefined && odometer !== null && typeof odometer !== "number") {
    errors.push("Odometer must be a number");
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  next();
};

router.post("/", validateVehicle, async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }
    res.json({ message: "Vehicle deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
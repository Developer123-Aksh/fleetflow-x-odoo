const router = require("express").Router();
const mongoose = require("mongoose");
const Trip = require("../models/Trip");
const Vehicle = require("../models/vehicle");
const Driver = require("../models/Driver");

const validateTrip = async (req, res, next) => {
  const { vehicle, driver, cargo, state } = req.body;
  const errors = [];

  if (!vehicle || typeof vehicle !== "string" || vehicle.trim() === "") {
    errors.push("Vehicle is required");
  } else if (!mongoose.Types.ObjectId.isValid(vehicle)) {
    errors.push("Invalid vehicle ID format");
  }
  if (!driver || typeof driver !== "string" || driver.trim() === "") {
    errors.push("Driver is required");
  } else if (!mongoose.Types.ObjectId.isValid(driver)) {
    errors.push("Invalid driver ID format");
  }
  if (cargo === undefined || cargo === null || typeof cargo !== "number" || cargo < 0) {
    errors.push("Cargo must be a non-negative number");
  }

  const validStates = ["draft", "dispatched", "completed", "cancelled"];
  if (state && !validStates.includes(state)) {
    errors.push(`State must be one of: ${validStates.join(", ")}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const v = await Vehicle.findById(vehicle);
  if (!v) {
    return res.status(404).json({ error: "Vehicle not found" });
  }
  if (v.status === "on_trip") {
    return res.status(400).json({ error: "Vehicle is already on a trip" });
  }
  if (v.status === "in_shop") {
    return res.status(400).json({ error: "Vehicle is in maintenance" });
  }

  const d = await Driver.findById(driver);
  if (!d) {
    return res.status(404).json({ error: "Driver not found" });
  }
  if (d.status === "suspended") {
    return res.status(400).json({ error: "Driver is suspended" });
  }
  if (d.status === "off_duty") {
    return res.status(400).json({ error: "Driver is off duty" });
  }
  if (d.licenseExpiry) {
    const expiryDate = new Date(d.licenseExpiry);
    if (expiryDate < new Date()) {
      return res.status(400).json({ error: "Driver's license has expired" });
    }
  }

  if (cargo > v.capacity) {
    return res.status(400).json({ error: `Cargo (${cargo}) exceeds vehicle capacity (${v.capacity})` });
  }

  req.vehicle = v;
  req.driver = d;
  next();
};

router.post("/", validateTrip, async (req, res) => {
  try {
    const { state } = req.body;
    
    const trip = await Trip.create(req.body);

    if (state === "dispatched" || state === "completed") {
      await Vehicle.findByIdAndUpdate(req.body.vehicle, { status: "on_trip" });
      await Driver.findByIdAndUpdate(req.body.driver, { status: "on_duty" });
    }

    res.status(201).json(trip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const trips = await Trip.find().populate("vehicle").populate("driver");
    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id).populate("vehicle").populate("driver");
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }
    res.json(trip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    const oldState = trip.state;
    const newState = req.body.state;

    const updatedTrip = await Trip.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (newState === "completed" && oldState !== "completed") {
      await Vehicle.findByIdAndUpdate(trip.vehicle, { status: "available" });
      await Driver.findByIdAndUpdate(trip.driver, { status: "available" });
    } else if (newState === "cancelled" && oldState !== "cancelled") {
      await Vehicle.findByIdAndUpdate(trip.vehicle, { status: "available" });
      await Driver.findByIdAndUpdate(trip.driver, { status: "available" });
    } else if (newState === "dispatched" && oldState === "draft") {
      await Vehicle.findByIdAndUpdate(trip.vehicle, { status: "on_trip" });
      await Driver.findByIdAndUpdate(trip.driver, { status: "on_duty" });
    }

    res.json(updatedTrip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const trip = await Trip.findByIdAndDelete(req.params.id);
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }
    res.json({ message: "Trip deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

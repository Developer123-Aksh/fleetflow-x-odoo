const router = require("express").Router();
const mongoose = require("mongoose");
const Trip = require("../models/Trip");
const Vehicle = require("../models/vehicle");
const Driver = require("../models/Driver");

const validateTrip = async (req, res, next) => {
  const { vehicle, driver, origin, destination, cargo_weight_kg, status } = req.body;
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
  if (!origin || typeof origin !== "string" || origin.trim() === "") {
    errors.push("Origin is required");
  }
  if (!destination || typeof destination !== "string" || destination.trim() === "") {
    errors.push("Destination is required");
  }
  if (cargo_weight_kg === undefined || cargo_weight_kg === null || typeof cargo_weight_kg !== "number" || cargo_weight_kg < 0) {
    errors.push("Cargo weight must be a non-negative number");
  }

  const validStatuses = ["pending", "in_progress", "completed", "cancelled"];
  if (status && !validStatuses.includes(status)) {
    errors.push(`Status must be one of: ${validStatuses.join(", ")}`);
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
  if (v.status === "retired") {
    return res.status(400).json({ error: "Vehicle is retired" });
  }

  const d = await Driver.findById(driver);
  if (!d) {
    return res.status(404).json({ error: "Driver not found" });
  }
  if (d.duty_status === "suspended") {
    return res.status(400).json({ error: "Driver is suspended" });
  }
  if (d.licenseExpiry) {
    const expiryDate = new Date(d.licenseExpiry);
    if (expiryDate < new Date()) {
      return res.status(400).json({ error: "Driver's license has expired" });
    }
  }

  if (cargo_weight_kg > v.capacity) {
    return res.status(400).json({ error: "Too heavy - cargo exceeds vehicle capacity" });
  }

  req.vehicle = v;
  req.driver = d;
  next();
};

router.post("/", validateTrip, async (req, res) => {
  try {
    const { status } = req.body;
    
    const trip = await Trip.create(req.body);

    if (status === "in_progress" || status === "completed") {
      await Vehicle.findByIdAndUpdate(req.body.vehicle, { status: "on_trip" });
      await Driver.findByIdAndUpdate(req.body.driver, { duty_status: "on_duty" });
    }

    res.status(201).json(trip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const trips = await Trip.find(filter).populate("vehicle", "name plate").populate("driver", "name");
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

router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "in_progress", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    const oldStatus = trip.status;
    const updatedTrip = await Trip.findByIdAndUpdate(req.params.id, { status }, { new: true });

    if (status === "completed" && oldStatus !== "completed") {
      await Vehicle.findByIdAndUpdate(trip.vehicle, { status: "available" });
      await Driver.findByIdAndUpdate(trip.driver, { duty_status: "on_duty" });
    } else if (status === "cancelled" && oldStatus !== "cancelled") {
      await Vehicle.findByIdAndUpdate(trip.vehicle, { status: "available" });
      await Driver.findByIdAndUpdate(trip.driver, { duty_status: "on_duty" });
    } else if (status === "in_progress" && oldStatus === "pending") {
      await Vehicle.findByIdAndUpdate(trip.vehicle, { status: "on_trip" });
      await Driver.findByIdAndUpdate(trip.driver, { duty_status: "on_duty" });
    }

    res.json(updatedTrip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }
    res.json(trip);
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

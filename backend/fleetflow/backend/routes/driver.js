const router = require("express").Router();
const Driver = require("../models/Driver");

const validateDriver = (req, res, next) => {
  const { name, license_number, licenseExpiry, duty_status } = req.body;
  const errors = [];

  if (!name || typeof name !== "string" || name.trim() === "") {
    errors.push("Name is required");
  }
  if (!license_number || typeof license_number !== "string" || license_number.trim() === "") {
    errors.push("License number is required");
  }
  if (!licenseExpiry) {
    errors.push("License expiry is required");
  } else {
    const expiryDate = new Date(licenseExpiry);
    if (isNaN(expiryDate.getTime())) {
      errors.push("License expiry must be a valid date");
    }
  }
  const validStatuses = ["on_duty", "on_break", "suspended"];
  if (duty_status && !validStatuses.includes(duty_status)) {
    errors.push(`Status must be one of: ${validStatuses.join(", ")}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  next();
};

router.post("/", validateDriver, async (req, res) => {
  try {
    const driver = await Driver.create(req.body);
    res.status(201).json(driver);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }
    res.json(driver);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", validateDriver, async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }
    res.json(driver);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/status", async (req, res) => {
  try {
    const { duty_status } = req.body;
    const validStatuses = ["on_duty", "on_break", "suspended"];
    if (!validStatuses.includes(duty_status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const driver = await Driver.findByIdAndUpdate(req.params.id, { duty_status }, { new: true });
    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }
    res.json(driver);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }
    res.json({ message: "Driver deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/complete", async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { $inc: { tripsCompleted: 1 } },
      { new: true }
    );
    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }
    res.json(driver);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/cancel", async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { $inc: { tripsCancelled: 1, complaints_count: 1 }, $inc: { safety_score: -5 } },
      { new: true }
    );
    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }
    if (driver.safety_score < 0) driver.safety_score = 0;
    await driver.save();
    res.json(driver);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "fleetflow-secret-key";

const validateUser = (req, res, next) => {
  const { email, password, name, role } = req.body;
  const errors = [];

  if (!email || typeof email !== "string" || !email.includes("@")) {
    errors.push("Valid email is required");
  }
  if (!password || typeof password !== "string" || password.length < 4) {
    errors.push("Password must be at least 4 characters");
  }
  if (!name || typeof name !== "string" || name.trim() === "") {
    errors.push("Name is required");
  }

  const validRoles = ["manager", "dispatcher", "safety", "analyst"];
  if (role && !validRoles.includes(role)) {
    errors.push(`Role must be one of: ${validRoles.join(", ")}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  next();
};

router.post("/register", validateUser, async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, name, role });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "24h" });
    res.status(201).json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "24h" });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

router.post("/logout", (req, res) => {
  res.json({ message: "Logged out successfully. Please remove token from client." });
});

module.exports = router;

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/fleetflow";

mongoose.connect(mongoUri)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Routes
app.use("/auth", require("./routes/auth"));
app.use("/vehicles", require("./routes/vehicle"));
app.use("/drivers", require("./routes/driver"));
app.use("/trips", require("./routes/trip"));
app.use("/maintenance", require("./routes/maintenance"));
app.use("/expenses", require("./routes/expense"));
app.use("/dashboard", require("./routes/dashboard"));

app.listen(3000, () => {
  console.log("Backend running on http://localhost:3000");
});
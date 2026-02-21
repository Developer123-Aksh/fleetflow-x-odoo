const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/fleetflow")
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));

// Routes
app.use("/vehicles", require("./routes/vehicle"));
app.use("/drivers", require("./routes/driver"));
app.use("/trips", require("./routes/trip"));
app.use("/maintenance", require("./routes/maintenance"));

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});
const router = require("express").Router();
const Maintenance = require("../models/Maintenance");
const Vehicle = require("../models/vehicle");

router.post("/", async(req,res)=>{
  const m = await Maintenance.create(req.body);
  await Vehicle.findByIdAndUpdate(req.body.vehicle,{status:"in_shop"});
  res.json(m);
});

module.exports = router;
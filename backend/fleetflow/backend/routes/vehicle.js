const router = require("express").Router();
const Vehicle = require("../models/vehicle");

router.post("/", async(req,res)=>{
  res.json(await Vehicle.create(req.body));
});

router.get("/", async(req,res)=>{
  res.json(await Vehicle.find());
});

module.exports = router;
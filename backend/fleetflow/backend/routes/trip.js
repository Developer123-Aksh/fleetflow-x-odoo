const router = require("express").Router();
const Trip = require("../models/Trip");
const Vehicle = require("../models/vehicle");

router.post("/", async(req,res)=>{
 const v = await Vehicle.findById(req.body.vehicle);
 if(req.body.cargo > v.capacity)
   return res.status(400).send("Capacity exceeded");

 v.status="on_trip";
 await v.save();

 res.json(await Trip.create(req.body));
});

module.exports = router;

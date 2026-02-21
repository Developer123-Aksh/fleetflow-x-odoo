const router = require("express").Router();
const Driver = require("../models/Driver");

router.post("/", async(req,res)=>{
  res.json(await Driver.create(req.body));
});

router.get("/", async(req,res)=>{
  res.json(await Driver.find());
});

module.exports = router;
const router = require("express").Router();
const Vehicle = require("../models/vehicle");
const Driver = require("../models/Driver");
const Trip = require("../models/Trip");
const Maintenance = require("../models/Maintenance");
const Expense = require("../models/Expense");

router.get("/stats", async (req, res) => {
  try {
    const [
      totalVehicles,
      activeVehicles,
      inShopVehicles,
      availableVehicles,
      totalDrivers,
      activeDrivers,
      pendingTrips,
      completedTrips,
      totalExpenses
    ] = await Promise.all([
      Vehicle.countDocuments(),
      Vehicle.countDocuments({ status: "on_trip" }),
      Vehicle.countDocuments({ status: "in_shop" }),
      Vehicle.countDocuments({ status: "available" }),
      Driver.countDocuments(),
      Driver.countDocuments({ duty_status: "on_duty" }),
      Trip.countDocuments({ status: "pending" }),
      Trip.countDocuments({ status: "completed" }),
      Expense.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }])
    ]);

    const utilizationRate = totalVehicles > 0 
      ? Math.round((activeVehicles / totalVehicles) * 100) 
      : 0;

    res.json({
      activeFleet: activeVehicles,
      maintenanceAlerts: inShopVehicles,
      availableVehicles,
      utilizationRate,
      pendingCargo: pendingTrips,
      totalExpenses: totalExpenses[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/trips", async (req, res) => {
  try {
    const trips = await Trip.find()
      .populate("vehicle", "name plate")
      .populate("driver", "name")
      .sort({ created_at: -1 })
      .limit(20);
    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/fuel-efficiency", async (req, res) => {
  try {
    const fuelExpenses = await Expense.aggregate([
      { $match: { type: "fuel" } },
      { $group: { _id: "$vehicle", totalCost: { $sum: "$amount" }, totalLiters: { $sum: "$liters" } } }
    ]);

    const vehicles = await Vehicle.find();
    
    const result = fuelExpenses.map(e => {
      const v = vehicles.find(v => v._id.toString() === e._id?.toString());
      return {
        vehicle: v?.name || "Unknown",
        totalLiters: e.totalLiters || 0,
        totalCost: e.totalCost || 0,
        efficiency: e.totalLiters > 0 ? (e.totalCost / e.totalLiters).toFixed(2) : 0
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/vehicle-roi/:id", async (req, res) => {
  try {
    const vehicleId = req.params.id;
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });

    const totalExpenses = await Expense.aggregate([
      { $match: { vehicle: require("mongoose").Types.ObjectId.createFromHexString(vehicleId) } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const trips = await Trip.find({ vehicle: vehicleId, status: "completed" });
    const revenue = trips.length * 500;

    const roi = revenue - (totalExpenses[0]?.total || 0);

    res.json({
      vehicle: vehicle.name,
      totalExpenses: totalExpenses[0]?.total || 0,
      completedTrips: trips.length,
      estimatedRevenue: revenue,
      roi
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/monthly-summary", async (req, res) => {
  try {
    const expenses = await Expense.aggregate([
      {
        $group: {
          _id: { $month: "$date" },
          fuel: { $sum: { $cond: [{ $eq: ["$type", "fuel"] }, "$amount", 0] } },
          repair: { $sum: { $cond: [{ $eq: ["$type", "repair"] }, "$amount", 0] } },
          other: { $sum: { $cond: [{ $eq: ["$type", "other"] }, "$amount", 0] } },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    res.json(expenses.map(e => ({
      month: months[e._id - 1] || "Unknown",
      fuel: e.fuel,
      repair: e.repair,
      other: e.other,
      total: e.total
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const [
      totalVehicles,
      activeVehicles,
      inShopVehicles,
      availableVehicles,
      totalDrivers,
      activeDrivers,
      suspendedDrivers,
      pendingTrips,
      completedTrips,
      totalExpenses
    ] = await Promise.all([
      Vehicle.countDocuments(),
      Vehicle.countDocuments({ status: "on_trip" }),
      Vehicle.countDocuments({ status: "in_shop" }),
      Vehicle.countDocuments({ status: "available" }),
      Driver.countDocuments(),
      Driver.countDocuments({ duty_status: "on_duty" }),
      Driver.countDocuments({ duty_status: "suspended" }),
      Trip.countDocuments({ status: "pending" }),
      Trip.countDocuments({ status: "completed" }),
      Expense.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }])
    ]);

    const utilizationRate = totalVehicles > 0 
      ? Math.round((activeVehicles / totalVehicles) * 100) 
      : 0;

    res.json({
      vehicles: { total: totalVehicles, active: activeVehicles, inShop: inShopVehicles, available: availableVehicles, utilizationRate },
      drivers: { total: totalDrivers, active: activeDrivers, suspended: suspendedDrivers },
      trips: { pending: pendingTrips, completed: completedTrips },
      totalExpenses: totalExpenses[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/analytics", async (req, res) => {
  try {
    const fuelExpenses = await Expense.aggregate([
      { $match: { type: "fuel" } },
      { $group: { _id: null, totalCost: { $sum: "$amount" }, totalLiters: { $sum: "$liters" } } }
    ]);

    const repairExpenses = await Expense.aggregate([
      { $match: { type: "repair" } },
      { $group: { _id: null, totalCost: { $sum: "$amount" } } }
    ]);

    const vehicleCosts = await Expense.aggregate([
      { $group: { _id: "$vehicle", totalCost: { $sum: "$amount" } } }
    ]);

    const vehicles = await Vehicle.find();
    const totalVehicles = vehicles.length;
    const totalCost = vehicleCosts.reduce((sum, v) => sum + v.totalCost, 0);

    const avgCostPerVehicle = totalVehicles > 0 ? Math.round(totalCost / totalVehicles) : 0;
    const completedTrips = await Trip.countDocuments({ status: "completed" });

    const driverStats = await Driver.find().select("name safety_score tripsCompleted tripsCancelled");

    res.json({
      fuel: { totalCost: fuelExpenses[0]?.totalCost || 0, totalLiters: fuelExpenses[0]?.totalLiters || 0 },
      repair: { totalCost: repairExpenses[0]?.totalCost || 0 },
      totalOperationalCost: totalCost,
      avgCostPerVehicle,
      completedTrips,
      drivers: driverStats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

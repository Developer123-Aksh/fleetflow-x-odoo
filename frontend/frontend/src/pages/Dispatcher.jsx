import { useState, useEffect } from "react";
import Table from "../components/Table";
import Modal from "../components/Modal";
import StatusPill from "../components/StatusPill";
import { useToast, ToastContainer } from "../components/Toast";
import { api } from "../api";

function Dispatcher() {
  const { toasts, addToast } = useToast();
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedTripIdx, setSelectedTripIdx] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [finalOdometer, setFinalOdometer] = useState("");

  const [formData, setFormData] = useState({
    vehicle: "",
    driver: "",
    cargo_weight_kg: "",
    origin: "",
    destination: "",
    estimated_fuel_cost: "",
  });

  const [errors, setErrors] = useState({});

  const fetchData = async () => {
    try {
      const [tripsData, vehiclesData, driversData] = await Promise.all([
        api.trips.getAll(),
        api.vehicles.getAll({ status: "available" }),
        api.drivers.getAll(),
      ]);
      setTrips(tripsData);
      setVehicles(vehiclesData);
      setDrivers(driversData.filter(d => d.duty_status !== "suspended"));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    const vehicle = vehicles.find((v) => v._id === formData.vehicle);
    const driver = drivers.find((d) => d._id === formData.driver);

    if (!formData.vehicle) newErrors.vehicle = "Vehicle required";
    else if (vehicle && vehicle.status !== "available") newErrors.vehicle = "Vehicle must be Available";

    if (!formData.driver) newErrors.driver = "Driver required";
    else if (driver && driver.duty_status === "suspended") newErrors.driver = "Driver is suspended";
    else if (driver && new Date(driver.licenseExpiry) < new Date()) newErrors.driver = "Driver license expired";

    if (!formData.origin || formData.origin.trim() === "")
      newErrors.origin = "Pickup location required";

    if (!formData.destination || formData.destination.trim() === "")
      newErrors.destination = "Drop location required";

    if (!formData.cargo_weight_kg || Number(formData.cargo_weight_kg) <= 0)
      newErrors.cargo_weight_kg = "Valid cargo weight required";
    else if (vehicle && Number(formData.cargo_weight_kg) > vehicle.capacity)
      newErrors.cargo_weight_kg = `Exceeds capacity (${vehicle.capacity}kg)`;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDispatchTrip = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      addToast("Please fix validation errors", "error");
      return;
    }

    try {
      await api.trips.create({
        vehicle: formData.vehicle,
        driver: formData.driver,
        origin: formData.origin,
        destination: formData.destination,
        cargo_weight_kg: Number(formData.cargo_weight_kg),
        estimated_fuel_cost: Number(formData.estimated_fuel_cost) || 0,
        status: "pending",
      });
      
      fetchData();
      setFormData({ vehicle: "", driver: "", cargo_weight_kg: "", origin: "", destination: "", estimated_fuel_cost: "" });
      setShowForm(false);
      addToast("Trip created successfully", "success");
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const openStatusModal = (idx, newStat) => {
    setSelectedTripIdx(idx);
    setNewStatus(newStat);
    if (newStatus === "completed") {
      setShowStatusModal(true);
    } else {
      updateTripStatus(idx, newStat);
    }
  };

  const handleCompleteTrip = async () => {
    if (!finalOdometer) {
      addToast("Enter final odometer reading", "error");
      return;
    }
    await updateTripStatus(selectedTripIdx, "completed");
    setShowStatusModal(false);
    setFinalOdometer("");
  };

  const updateTripStatus = async (idx, status) => {
    const trip = trips[idx];
    try {
      await api.trips.updateStatus(trip._id, status);
      fetchData();
      addToast(`Trip status updated to ${status}`, "success");
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const deleteTripHandler = async (idx) => {
    const trip = trips[idx];
    if (window.confirm("Are you sure you want to delete this trip?")) {
      try {
        await api.trips.delete(trip._id);
        fetchData();
        addToast("Trip deleted", "success");
      } catch (err) {
        addToast(err.message, "error");
      }
    }
  };

  const getVehicleName = (vehicle) => {
    if (!vehicle) return "N/A";
    return `${vehicle.name} (${vehicle.plate})`;
  };

  const getDriverName = (driver) => {
    if (!driver) return "N/A";
    return driver.name;
  };

  const columns = [
    { key: "_id", label: "Trip ID", render: (val) => val?.slice(-6) || "N/A" },
    { key: "vehicle", label: "Vehicle", render: (v) => getVehicleName(v) },
    { key: "driver", label: "Driver", render: (d) => getDriverName(d) },
    { key: "origin", label: "Pickup" },
    { key: "destination", label: "Drop" },
    { key: "cargo_weight_kg", label: "Cargo (kg)" },
    { key: "status", label: "Status", render: (status) => <StatusPill status={status} /> },
  ];

  const actions = [
    {
      label: "Start",
      className: "btn-dispatch",
      handler: (idx, trip) => {
        if (trip.status === "pending") openStatusModal(idx, "in_progress");
        else addToast("Only Pending trips can be started", "error");
      },
    },
    {
      label: "Complete",
      className: "btn-complete",
      handler: (idx, trip) => {
        if (trip.status === "in_progress") openStatusModal(idx, "completed");
        else addToast("Only In Progress trips can be completed", "error");
      },
    },
    {
      label: "Cancel",
      className: "btn-cancel",
      handler: (idx, trip) => {
        if (trip.status !== "completed") updateTripStatus(idx, "cancelled");
        else addToast("Completed trips cannot be cancelled", "error");
      },
    },
    {
      label: "Delete",
      className: "btn-delete",
      handler: deleteTripHandler,
    },
  ];

  if (loading) {
    return <div className="container"><div className="loading">Loading trips...</div></div>;
  }

  return (
    <div className="container">
      <ToastContainer toasts={toasts} />
      <div className="page-header">
        <h1 className="page-title">Trip Dispatcher & Management</h1>
        <button className="primary-btn" onClick={() => setShowForm(true)}>
          + New Trip
        </button>
      </div>

      {error && <div className="error-message" style={{marginBottom: 16}}>{error}</div>}

      {showForm && (
        <div className="form-card">
          <h2>Create Trip</h2>
          <form onSubmit={handleDispatchTrip}>
            <div className="form-group">
              <label>Vehicle *</label>
              <select
                name="vehicle"
                value={formData.vehicle}
                onChange={handleInputChange}
                className={errors.vehicle ? "error" : ""}
              >
                <option value="">Select Vehicle</option>
                {vehicles.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.name} ({v.plate}) - Cap: {v.capacity}kg
                  </option>
                ))}
              </select>
              {errors.vehicle && <span className="error-text">{errors.vehicle}</span>}
            </div>

            <div className="form-group">
              <label>Driver *</label>
              <select
                name="driver"
                value={formData.driver}
                onChange={handleInputChange}
                className={errors.driver ? "error" : ""}
              >
                <option value="">Select Driver</option>
                {drivers.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} (Exp: {d.licenseExpiry ? new Date(d.licenseExpiry).toLocaleDateString() : 'N/A'})
                  </option>
                ))}
              </select>
              {errors.driver && <span className="error-text">{errors.driver}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Pickup Location *</label>
                <input
                  type="text"
                  name="origin"
                  value={formData.origin}
                  onChange={handleInputChange}
                  placeholder="e.g., Warehouse A"
                  className={errors.origin ? "error" : ""}
                />
                {errors.origin && <span className="error-text">{errors.origin}</span>}
              </div>

              <div className="form-group">
                <label>Drop Location *</label>
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  placeholder="e.g., Store B"
                  className={errors.destination ? "error" : ""}
                />
                {errors.destination && <span className="error-text">{errors.destination}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Cargo Weight (kg) *</label>
                <input
                  type="number"
                  name="cargo_weight_kg"
                  value={formData.cargo_weight_kg}
                  onChange={handleInputChange}
                  placeholder="in kg"
                  className={errors.cargo_weight_kg ? "error" : ""}
                />
                {errors.cargo_weight_kg && <span className="error-text">{errors.cargo_weight_kg}</span>}
              </div>

              <div className="form-group">
                <label>Est. Fuel Cost</label>
                <input
                  type="number"
                  name="estimated_fuel_cost"
                  value={formData.estimated_fuel_cost}
                  onChange={handleInputChange}
                  placeholder="in ₹"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="primary-btn">
                Create Trip
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ vehicle: "", driver: "", cargo_weight_kg: "", origin: "", destination: "", estimated_fuel_cost: "" });
                  setErrors({});
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="section">
        <h2>All Trips</h2>
        <Table columns={columns} data={trips} actions={actions} />
      </div>

      <Modal
        isOpen={showStatusModal}
        title={newStatus === "completed" ? "Complete Trip" : `Update Status to ${newStatus}`}
        onClose={() => {
          setShowStatusModal(false);
          setFinalOdometer("");
        }}
        onConfirm={newStatus === "completed" ? handleCompleteTrip : () => setShowStatusModal(false)}
        confirmText={newStatus === "completed" ? "Complete" : "Update"}
      >
        {newStatus === "completed" && (
          <div className="form-group">
            <label>Final Odometer Reading (km) *</label>
            <input
              type="number"
              value={finalOdometer}
              onChange={(e) => setFinalOdometer(e.target.value)}
              placeholder="Enter final odometer reading"
            />
          </div>
        )}
        {newStatus !== "completed" && <p>Are you sure you want to update trip status to {newStatus}?</p>}
      </Modal>
    </div>
  );
}

export default Dispatcher;

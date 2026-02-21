import { useState, useEffect } from "react";
import Table from "../components/Table";
import StatusPill from "../components/StatusPill";
import { useToast, ToastContainer } from "../components/Toast";
import { api } from "../api";

const SERVICE_TYPES = ["Oil Change", "Tire Replacement", "Engine Repair", "Brake Service", "Battery Replacement", "Regular Checkup"];

function Maintenance() {
  const { toasts, addToast } = useToast();
  const [serviceLogs, setServiceLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    vehicle: "",
    service_type: "",
    cost: "",
    date: "",
    notes: "",
    technician: "",
    status: "open",
  });

  const [errors, setErrors] = useState({});

  const fetchData = async () => {
    try {
      const [logsData, vehiclesData] = await Promise.all([
        api.maintenance.getAll(),
        api.vehicles.getAll(),
      ]);
      setServiceLogs(logsData);
      setVehicles(vehiclesData);
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
    if (!formData.vehicle) newErrors.vehicle = "Vehicle required";
    if (!formData.service_type) newErrors.service_type = "Service type required";
    if (!formData.cost || Number(formData.cost) < 0) newErrors.cost = "Valid cost required";
    if (!formData.date) newErrors.date = "Date required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      addToast("Please fix validation errors", "error");
      return;
    }

    try {
      await api.maintenance.create({
        vehicle: formData.vehicle,
        service_type: formData.service_type,
        cost: Number(formData.cost) || 0,
        date: formData.date,
        notes: formData.notes,
        technician: formData.technician,
        status: formData.status,
      });
      
      fetchData();
      setFormData({ vehicle: "", service_type: "", cost: "", date: "", notes: "", technician: "", status: "open" });
      setShowForm(false);
      addToast("Service log added successfully", "success");
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const updateServiceStatus = async (idx, newStatus) => {
    const log = serviceLogs[idx];
    try {
      await api.maintenance.update(log._id, { status: newStatus });
      fetchData();
      addToast(`Service status updated to ${newStatus}`, "success");
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const deleteServiceHandler = async (idx) => {
    const log = serviceLogs[idx];
    if (window.confirm("Are you sure you want to delete this service log?")) {
      try {
        await api.maintenance.delete(log._id);
        fetchData();
        addToast("Service log deleted", "success");
      } catch (err) {
        addToast(err.message, "error");
      }
    }
  };

  const getVehicleName = (vehicle) => {
    if (!vehicle) return "N/A";
    return `${vehicle.name} (${vehicle.plate})`;
  };

  const getTotalCost = () => {
    return serviceLogs.reduce((sum, log) => sum + (log.cost || 0), 0);
  };

  const columns = [
    { key: "_id", label: "ID", render: (val) => val?.slice(-6) || "N/A" },
    { key: "vehicle", label: "Vehicle", render: (v) => getVehicleName(v) },
    { key: "service_type", label: "Service Type" },
    { key: "cost", label: "Cost (₹)", render: (val) => `₹${val || 0}` },
    { key: "date", label: "Date", render: (val) => val ? new Date(val).toLocaleDateString() : "-" },
    { key: "technician", label: "Technician" },
    { key: "status", label: "Status", render: (status) => <StatusPill status={status === "open" ? "Pending" : "Completed"} /> },
  ];

  const actions = [
    {
      label: "Resolve",
      className: "btn-complete",
      handler: (idx, log) => {
        if (log.status === "open") updateServiceStatus(idx, "resolved");
        else addToast("Already resolved", "error");
      },
    },
    {
      label: "Delete",
      className: "btn-delete",
      handler: deleteServiceHandler,
    },
  ];

  if (loading) {
    return <div className="container"><div className="loading">Loading maintenance logs...</div></div>;
  }

  return (
    <div className="container">
      <ToastContainer toasts={toasts} />
      <div className="page-header">
        <h1 className="page-title">Maintenance & Service Logs</h1>
        <button className="primary-btn" onClick={() => setShowForm(true)}>
          + Add Service Log
        </button>
      </div>

      {error && <div className="error-message" style={{marginBottom: 16}}>{error}</div>}

      {showForm && (
        <div className="form-card">
          <h2>Add Service Log</h2>
          <form onSubmit={handleAddService}>
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
                    {v.name} ({v.plate})
                  </option>
                ))}
              </select>
              {errors.vehicle && <span className="error-text">{errors.vehicle}</span>}
            </div>

            <div className="form-group">
              <label>Service Type *</label>
              <select
                name="service_type"
                value={formData.service_type}
                onChange={handleInputChange}
                className={errors.service_type ? "error" : ""}
              >
                <option value="">Select Service Type</option>
                {SERVICE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.service_type && <span className="error-text">{errors.service_type}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Cost (₹)</label>
                <input
                  type="number"
                  name="cost"
                  value={formData.cost}
                  onChange={handleInputChange}
                  placeholder="Service cost"
                  className={errors.cost ? "error" : ""}
                />
                {errors.cost && <span className="error-text">{errors.cost}</span>}
              </div>

              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className={errors.date ? "error" : ""}
                />
                {errors.date && <span className="error-text">{errors.date}</span>}
              </div>
            </div>

            <div className="form-group">
              <label>Technician</label>
              <input
                type="text"
                name="technician"
                value={formData.technician}
                onChange={handleInputChange}
                placeholder="Technician name"
              />
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Additional notes about the service"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="primary-btn">
                Add Service Log
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ vehicle: "", service_type: "", cost: "", date: "", notes: "", technician: "", status: "open" });
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
        <div className="stats-row">
          <div className="stat-box">
            <div className="stat-label">Total Services Logged</div>
            <div className="stat-value">{serviceLogs.length}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Total Maintenance Cost</div>
            <div className="stat-value">₹{getTotalCost()}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Open Services</div>
            <div className="stat-value">{serviceLogs.filter((s) => s.status === "open").length}</div>
          </div>
        </div>
      </div>

      <div className="section">
        <h2>Service History</h2>
        <Table columns={columns} data={serviceLogs} actions={actions} />
      </div>
    </div>
  );
}

export default Maintenance;

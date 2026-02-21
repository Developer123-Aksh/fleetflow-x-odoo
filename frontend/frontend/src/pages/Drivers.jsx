import { useState, useEffect } from "react";
import Table from "../components/Table";
import StatusPill from "../components/StatusPill";
import { useToast, ToastContainer } from "../components/Toast";
import { validateLicenseExpiry } from "../utils/validation";
import { api } from "../api";

function Drivers() {
  const { toasts, addToast } = useToast();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    license_number: "",
    licenseExpiry: "",
    duty_status: "on_duty",
  });

  const [errors, setErrors] = useState({});

  const fetchDrivers = async () => {
    try {
      const data = await api.drivers.getAll();
      setDrivers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name || formData.name.trim().length < 2)
      newErrors.name = "Driver name required (min 2 chars)";
    if (!formData.license_number) newErrors.license_number = "License number required";
    if (!formData.licenseExpiry) newErrors.licenseExpiry = "License expiry date required";
    if (!validateLicenseExpiry(formData.licenseExpiry))
      newErrors.licenseExpiry = "License expiry date must be in future";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddDriver = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      addToast("Please fix validation errors", "error");
      return;
    }

    try {
      await api.drivers.create(formData);
      fetchDrivers();
      setFormData({ name: "", license_number: "", licenseExpiry: "", duty_status: "on_duty" });
      setShowForm(false);
      addToast("Driver added successfully", "success");
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const updateDriverStatus = async (idx, newStatus) => {
    const driver = drivers[idx];
    try {
      await api.drivers.updateStatus(driver._id, newStatus);
      fetchDrivers();
      addToast(`Driver status updated to ${newStatus}`, "success");
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const deleteDriver = async (idx) => {
    const driver = drivers[idx];
    if (window.confirm("Are you sure you want to delete this driver?")) {
      try {
        await api.drivers.delete(driver._id);
        fetchDrivers();
        addToast("Driver deleted", "success");
      } catch (err) {
        addToast(err.message, "error");
      }
    }
  };

  const isLicenseExpired = (expiryDate) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    return expiry < today;
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "license_number", label: "License #" },
    { key: "licenseExpiry", label: "License Expiry", render: (val) => {
      const isExpired = isLicenseExpired(val);
      return (
        <span style={{ color: isExpired ? "red" : "green", fontWeight: isExpired ? "bold" : "normal" }}>
          {isExpired && "⚠️ "} {val ? new Date(val).toLocaleDateString() : '-'}
        </span>
      );
    }},
    { key: "duty_status", label: "Status", render: (status) => <StatusPill status={status === "suspended" ? "Cancelled" : status === "on_duty" ? "On Duty" : status} /> },
    { key: "tripsCompleted", label: "Trips Completed" },
    { key: "safety_score", label: "Safety Score", render: (score) => {
      const s = score || 0;
      const color = s >= 4.5 ? "#10b981" : s >= 3.5 ? "#f59e0b" : "#ef4444";
      return <span style={{ color }}>{s}/100 ⭐</span>;
    }},
  ];

  const actions = [
    {
      label: "Change Status",
      className: "btn-edit",
      handler: (idx, driver) => {
        const newStatus = driver.duty_status === "on_duty" ? "on_break" : "on_duty";
        if (isLicenseExpired(driver.licenseExpiry)) {
          addToast("Cannot assign trips - License expired", "error");
          return;
        }
        updateDriverStatus(idx, newStatus);
      },
    },
    {
      label: "Delete",
      className: "btn-delete",
      handler: deleteDriver,
    },
  ];

  const getTotalDrivers = () => drivers.length;
  const getActiveDrivers = () => drivers.filter((d) => d.duty_status === "on_duty").length;
  const getExpiredLicenses = () => drivers.filter((d) => isLicenseExpired(d.licenseExpiry)).length;
  const getAverageSafetyScore = () => {
    if (drivers.length === 0) return 0;
    return (drivers.reduce((sum, d) => sum + (d.safety_score || 0), 0) / drivers.length).toFixed(2);
  };

  if (loading) {
    return <div className="container"><div className="loading">Loading drivers...</div></div>;
  }

  return (
    <div className="container">
      <ToastContainer toasts={toasts} />
      <div className="page-header">
        <h1 className="page-title">👨‍✈️ Driver Profiles & Performance</h1>
        <button className="primary-btn" onClick={() => setShowForm(true)}>
          + Add Driver
        </button>
      </div>

      {error && <div className="error-message" style={{marginBottom: 16}}>{error}</div>}

      {showForm && (
        <div className="form-card">
          <h2>Add New Driver</h2>
          <form onSubmit={handleAddDriver}>
            <div className="form-group">
              <label>Driver Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter driver name"
                className={errors.name ? "error" : ""}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>License Number *</label>
                <input
                  type="text"
                  name="license_number"
                  value={formData.license_number}
                  onChange={handleInputChange}
                  placeholder="e.g., DL-001"
                  className={errors.license_number ? "error" : ""}
                />
                {errors.license_number && <span className="error-text">{errors.license_number}</span>}
              </div>

              <div className="form-group">
                <label>License Expiry *</label>
                <input
                  type="date"
                  name="licenseExpiry"
                  value={formData.licenseExpiry}
                  onChange={handleInputChange}
                  className={errors.licenseExpiry ? "error" : ""}
                />
                {errors.licenseExpiry && <span className="error-text">{errors.licenseExpiry}</span>}
              </div>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select name="duty_status" value={formData.duty_status} onChange={handleInputChange}>
                <option value="on_duty">On Duty</option>
                <option value="on_break">On Break</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="primary-btn">
                Add Driver
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ name: "", license_number: "", licenseExpiry: "", duty_status: "on_duty" });
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
            <div className="stat-label">Total Drivers</div>
            <div className="stat-value">{getTotalDrivers()}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Active Drivers</div>
            <div className="stat-value">{getActiveDrivers()}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">⚠️ Expired Licenses</div>
            <div className="stat-value">{getExpiredLicenses()}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Avg Safety Score</div>
            <div className="stat-value">{getAverageSafetyScore()} ⭐</div>
          </div>
        </div>
      </div>

      <div className="section">
        <h2>Driver Details</h2>
        <Table columns={columns} data={drivers} actions={actions} />
      </div>
    </div>
  );
}

export default Drivers;

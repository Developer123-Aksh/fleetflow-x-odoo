import { useState, useEffect } from "react";
import Table from "../components/Table";
import { useToast, ToastContainer } from "../components/Toast";
import { formatCurrency } from "../utils/calculations";
import { api } from "../api";

function FuelExpenses() {
  const { toasts, addToast } = useToast();
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    vehicle: "",
    type: "fuel",
    liters: "",
    amount: "",
    date: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});

  const fetchData = async () => {
    try {
      const [expensesData, vehiclesData] = await Promise.all([
        api.expenses.getAll(),
        api.vehicles.getAll(),
      ]);
      setExpenses(expensesData);
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
    if (!formData.amount || Number(formData.amount) < 0) newErrors.amount = "Valid amount required";
    if (formData.type === "fuel" && (!formData.liters || Number(formData.liters) <= 0)) newErrors.liters = "Valid liters required for fuel";
    if (!formData.date) newErrors.date = "Date required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      addToast("Please fix validation errors", "error");
      return;
    }

    try {
      await api.expenses.create({
        vehicle: formData.vehicle,
        type: formData.type,
        liters: formData.type === "fuel" ? Number(formData.liters) : undefined,
        amount: Number(formData.amount),
        date: formData.date,
        notes: formData.notes,
      });
      
      fetchData();
      setFormData({ vehicle: "", type: "fuel", liters: "", amount: "", date: "", notes: "" });
      setShowForm(false);
      addToast("Expense added successfully", "success");
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const deleteExpense = async (idx) => {
    const expense = expenses[idx];
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await api.expenses.delete(expense._id);
        fetchData();
        addToast("Expense deleted", "success");
      } catch (err) {
        addToast(err.message, "error");
      }
    }
  };

  const getVehicleName = (vehicle) => {
    if (!vehicle) return "N/A";
    return `${vehicle.name} (${vehicle.plate})`;
  };

  const fuelExpenses = expenses.filter(e => e.type === "fuel");
  const repairExpenses = expenses.filter(e => e.type === "repair");
  const otherExpenses = expenses.filter(e => e.type === "other");

  const getTotalFuelCost = () => fuelExpenses.reduce((sum, log) => sum + (log.amount || 0), 0);
  const getTotalMaintenanceCost = () => repairExpenses.reduce((sum, log) => sum + (log.amount || 0), 0);
  const getTotalOtherCost = () => otherExpenses.reduce((sum, log) => sum + (log.amount || 0), 0);
  const getTotalLiters = () => fuelExpenses.reduce((sum, log) => sum + (log.liters || 0), 0);

  const getVehicleStats = (vehicleId) => {
    const vehicleExpenses = expenses.filter(e => e.vehicle?._id === vehicleId || e.vehicle === vehicleId);
    const fuel = vehicleExpenses.filter(e => e.type === "fuel");
    const repair = vehicleExpenses.filter(e => e.type === "repair");
    
    const totalFuel = fuel.reduce((sum, l) => sum + (l.amount || 0), 0);
    const totalRepair = repair.reduce((sum, l) => sum + (l.amount || 0), 0);
    const totalLiters = fuel.reduce((sum, l) => sum + (l.liters || 0), 0);

    return {
      fuelCost: totalFuel,
      maintenanceCost: totalRepair,
      totalCost: totalFuel + totalRepair,
      totalLiters,
      efficiency: totalLiters > 0 ? (totalFuel / totalLiters).toFixed(2) : 0,
    };
  };

  const vehicleStatsColumns = [
    { key: "vehicle", label: "Vehicle", render: (v) => v ? getVehicleName(v) : "-" },
    { key: "fuelCost", label: "Fuel Cost (₹)", render: (val) => `₹${val.toFixed(2)}` },
    { key: "maintenanceCost", label: "Repair Cost (₹)", render: (val) => `₹${val.toFixed(2)}` },
    { key: "totalCost", label: "Total Cost (₹)", render: (val) => `₹${val.toFixed(2)}` },
    { key: "totalLiters", label: "Total Liters" },
    { key: "efficiency", label: "Cost/Liter (₹)" },
  ];

  const vehicleStatsData = vehicles.map((v) => {
    const stats = getVehicleStats(v._id);
    return {
      vehicle: v,
      ...stats,
    };
  });

  const expenseColumns = [
    { key: "_id", label: "ID", render: (val) => val?.slice(-6) || "N/A" },
    { key: "vehicle", label: "Vehicle", render: (v) => getVehicleName(v) },
    { key: "type", label: "Type" },
    { key: "liters", label: "Liters (L)", render: (val) => val || "-" },
    { key: "amount", label: "Amount (₹)", render: (val) => `₹${val}` },
    { key: "date", label: "Date", render: (val) => val ? new Date(val).toLocaleDateString() : "-" },
  ];

  const expenseActions = [
    {
      label: "Delete",
      className: "btn-delete",
      handler: deleteExpense,
    },
  ];

  if (loading) {
    return <div className="container"><div className="loading">Loading expenses...</div></div>;
  }

  return (
    <div className="container">
      <ToastContainer toasts={toasts} />
      <div className="page-header">
        <h1 className="page-title">⛽ Fuel & Expense Logging</h1>
        <button className="primary-btn" onClick={() => setShowForm(true)}>
          + Add Expense
        </button>
      </div>

      {error && <div className="error-message" style={{marginBottom: 16}}>{error}</div>}

      {showForm && (
        <div className="form-card">
          <h2>Add Expense</h2>
          <form onSubmit={handleAddExpense}>
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
              <label>Type *</label>
              <select name="type" value={formData.type} onChange={handleInputChange}>
                <option value="fuel">Fuel</option>
                <option value="repair">Repair</option>
                <option value="other">Other</option>
              </select>
            </div>

            {formData.type === "fuel" && (
              <div className="form-group">
                <label>Liters (L) *</label>
                <input
                  type="number"
                  name="liters"
                  value={formData.liters}
                  onChange={handleInputChange}
                  placeholder="Fuel in liters"
                  step="0.01"
                  className={errors.liters ? "error" : ""}
                />
                {errors.liters && <span className="error-text">{errors.liters}</span>}
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>Amount (₹) *</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="Cost in rupees"
                  step="0.01"
                  className={errors.amount ? "error" : ""}
                />
                {errors.amount && <span className="error-text">{errors.amount}</span>}
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
              <label>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Additional notes"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="primary-btn">
                Add Expense
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ vehicle: "", type: "fuel", liters: "", amount: "", date: "", notes: "" });
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
            <div className="stat-label">Total Fuel Cost</div>
            <div className="stat-value">{formatCurrency(getTotalFuelCost())}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Total Repair Cost</div>
            <div className="stat-value">{formatCurrency(getTotalMaintenanceCost())}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Total Other Cost</div>
            <div className="stat-value">{formatCurrency(getTotalOtherCost())}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Total Liters</div>
            <div className="stat-value">{getTotalLiters().toFixed(2)} L</div>
          </div>
        </div>
      </div>

      <div className="section">
        <h2>Vehicle-wise Summary</h2>
        <Table columns={vehicleStatsColumns} data={vehicleStatsData} />
      </div>

      <div className="section">
        <h2>All Expenses</h2>
        <Table columns={expenseColumns} data={expenses} actions={expenseActions} />
      </div>
    </div>
  );
}

export default FuelExpenses;

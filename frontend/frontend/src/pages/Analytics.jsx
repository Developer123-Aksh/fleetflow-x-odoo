import { useState, useEffect } from "react";
import { formatCurrency } from "../utils/calculations";
import { api } from "../api";

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [fuelEfficiency, setFuelEfficiency] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const [analyticsData, vehiclesData, fuelData, monthlyData] = await Promise.all([
        api.dashboard.getAnalytics(),
        api.vehicles.getAll(),
        api.dashboard.getFuelEfficiency(),
        api.dashboard.getMonthlySummary(),
      ]);
      setAnalytics(analyticsData);
      setVehicles(vehiclesData);
      setFuelEfficiency(fuelData);
      setMonthlySummary(monthlyData);
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

  const getVehicleMetrics = (vehicleId) => {
    const fe = fuelEfficiency.find(f => f.vehicle?._id === vehicleId || f.vehicle === vehicleId);
    const vehicle = vehicles.find(v => v._id === vehicleId);
    return {
      fuelEfficiency: fe?.efficiency || 0,
      totalFuelCost: fe?.totalCost || 0,
      totalLiters: fe?.totalLiters || 0,
      vehicleName: vehicle?.name || "Unknown",
    };
  };

  const metrics = {
    fuelCost: analytics?.fuel?.totalCost || 0,
    maintenanceCost: analytics?.repair?.totalCost || 0,
    totalCost: analytics?.totalOperationalCost || 0,
    fuelLiters: analytics?.fuel?.totalLiters || 0,
    completedTrips: analytics?.completedTrips || 0,
  };

  metrics.operationalCost = metrics.fuelCost + metrics.maintenanceCost;
  metrics.fuelEfficiency = metrics.fuelLiters > 0 ? (metrics.fuelCost / metrics.fuelLiters).toFixed(2) : 0;

  const handleExportCSV = () => {
    const csvContent = [
      ["Analytics Report", new Date().toLocaleDateString()],
      [],
      ["Overall Metrics"],
      ["Metric", "Value"],
      ["Total Fuel Cost", `₹${metrics.fuelCost}`],
      ["Total Maintenance Cost", `₹${metrics.maintenanceCost}`],
      ["Total Operational Cost", `₹${metrics.operationalCost}`],
      ["Completed Trips", metrics.completedTrips],
      ["Fuel Efficiency", `${metrics.fuelEfficiency} km/L`],
      [],
      ["Vehicle-wise Fuel Efficiency"],
      ["Vehicle", "Total Liters", "Total Cost", "Efficiency"],
      ...vehicles.map(v => {
        const m = getVehicleMetrics(v._id);
        return [m.vehicleName, m.totalLiters, m.totalFuelCost, m.fuelEfficiency];
      }),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fleet-analytics-${new Date().getTime()}.csv`;
    a.click();
  };

  if (loading) {
    return <div className="container"><div className="loading">Loading analytics...</div></div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">📊 Operational Analytics & Reports</h1>
        <div className="action-buttons">
          <button className="secondary-btn" onClick={handleExportCSV}>
            📥 Export CSV
          </button>
        </div>
      </div>

      {error && <div className="error-message" style={{marginBottom: 16}}>{error}</div>}

      <div className="section">
        <h2>Overall Fleet Metrics</h2>
        <div className="stats-row">
          <div className="stat-box">
            <div className="stat-label">Total Fuel Cost</div>
            <div className="stat-value">{formatCurrency(metrics.fuelCost)}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Total Maintenance Cost</div>
            <div className="stat-value">{formatCurrency(metrics.maintenanceCost)}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Total Operational Cost</div>
            <div className="stat-value">{formatCurrency(metrics.operationalCost)}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Completed Trips</div>
            <div className="stat-value">{metrics.completedTrips}</div>
          </div>
        </div>
      </div>

      {monthlySummary.length > 0 && (
        <div className="section">
          <h2>Monthly Expense Summary</h2>
          <div className="chart-container">
            <div className="simple-chart">
              {monthlySummary.map((data) => (
                <div key={data.month} className="chart-bar">
                  <div className="bar-label">{data.month}</div>
                  <div className="bar-visual">
                    <div
                      className="bar"
                      style={{ height: `${Math.min(100, (data.total / (metrics.operationalCost || 1)) * 100)}%` }}
                    />
                  </div>
                  <div className="bar-value">₹{data.total}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="section">
        <h2>Vehicle Performance</h2>
        <div className="vehicle-analysis">
          {vehicles.map((vehicle) => {
            const m = getVehicleMetrics(vehicle._id);
            return (
              <div key={vehicle._id} className="vehicle-card">
                <h3>{vehicle.name} ({vehicle.plate})</h3>
                <div className="metrics-grid">
                  <div className="metric-item">
                    <div className="metric-label">Total Liters</div>
                    <div className="metric-value">{m.totalLiters} L</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-label">Fuel Cost</div>
                    <div className="metric-value">{formatCurrency(m.totalFuelCost)}</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-label">Cost per Liter</div>
                    <div className="metric-value">₹{m.fuelEfficiency}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {analytics?.drivers && analytics.drivers.length > 0 && (
        <div className="section">
          <h2>Driver Performance</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Driver</th>
                <th>Safety Score</th>
                <th>Trips Completed</th>
              </tr>
            </thead>
            <tbody>
              {analytics.drivers.map((driver) => (
                <tr key={driver._id}>
                  <td>{driver.name}</td>
                  <td>{driver.safety_score || 0}</td>
                  <td>{driver.tripsCompleted || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Analytics;

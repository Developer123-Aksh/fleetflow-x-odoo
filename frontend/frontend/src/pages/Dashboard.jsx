import KPI from "../components/KPI.jsx";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

function Dashboard() {
  const [metrics, setMetrics] = useState({
    activeFleet: 0,
    maintenanceAlerts: 0,
    utilizationRate: 0,
    pendingCargo: 0,
    totalTripsToday: 0,
    driversOnDuty: 0,
    totalOperationalCost: 0,
    fuelEfficiency: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const [stats, trips] = await Promise.all([
        api.dashboard.getStats(),
        api.dashboard.getTrips()
      ]);
      
      setMetrics({
        activeFleet: stats.activeFleet || 0,
        maintenanceAlerts: stats.maintenanceAlerts || 0,
        utilizationRate: stats.utilizationRate || 0,
        pendingCargo: stats.pendingCargo || 0,
        totalTripsToday: trips.filter(t => {
          const today = new Date().toDateString();
          return new Date(t.created_at).toDateString() === today;
        }).length,
        driversOnDuty: stats.activeDrivers || 0,
        totalOperationalCost: stats.totalExpenses || 0,
        fuelEfficiency: 0,
      });
      setLastUpdated(new Date().toLocaleTimeString());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  if (loading) {
    return <div className="container"><div className="loading">Loading dashboard...</div></div>;
  }

  if (error) {
    return <div className="container"><div className="error-message">{error}</div></div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>🚀 Command Center</h1>

        <div className="header-right">
          <label className="auto-refresh-toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto Refresh (30s)
          </label>

          {lastUpdated && (
            <span className="last-updated">
              ⏱ Last updated: {lastUpdated}
            </span>
          )}
        </div>
      </div>

      <div className="kpi-grid">
        <KPI title="Active Fleet" value={metrics.activeFleet} color="#10b981" />
        <KPI title="Maintenance Alerts" value={metrics.maintenanceAlerts} color="#ef4444" />
        <KPI title="Utilization Rate" value={`${Math.round(metrics.utilizationRate)}%`} color="#3b82f6" />
        <KPI title="Pending Cargo" value={metrics.pendingCargo} color="#f59e0b" />
        <KPI title="Trips Today" value={metrics.totalTripsToday} color="#8b5cf6" />
        <KPI title="Drivers On Duty" value={metrics.driversOnDuty} color="#06b6d4" />
        <KPI title="Op. Cost (Today)" value={`₹${Math.round(metrics.totalOperationalCost)}`} color="#ec4899" />
        <KPI title="Fuel Efficiency" value={`${metrics.fuelEfficiency} km/L`} color="#14b8a6" />
      </div>

      <div className="dashboard-section">
        <h2>⚡ Quick Actions</h2>

        <div className="actions-grid">
          <Link to="/dispatch" className="action-card">🚚 Create Trip</Link>
          <Link to="/vehicles" className="action-card">🚛 Manage Vehicles</Link>
          <Link to="/drivers" className="action-card">👨‍✈️ Driver Profiles</Link>
          <Link to="/maintenance" className="action-card">🔧 Maintenance</Link>
          <Link to="/fuel" className="action-card">⛽ Fuel & Expenses</Link>
          <Link to="/analytics" className="action-card">📊 Analytics</Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("theme") || "dark";
    } catch (e) {
      return "dark";
    }
  });

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    try { localStorage.setItem("theme", theme); } catch (e) {}
  }, [theme]);

  function toggleTheme() {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sidebar" aria-label="Main navigation">
      <div className="brand">
        <img src="/logo_of_fleetflow.png" alt="FleetFlow" className="brand-logo" />
        <h2>FleetFlow</h2>
      </div>

      <div className="nav-links">
        <Link to="/" className="nav-item">
          <span>📊</span> Dashboard
        </Link>
        <Link to="/vehicles" className="nav-item">
          <span>🚛</span> Vehicles
        </Link>
        <Link to="/dispatch" className="nav-item">
          <span>🚚</span> Dispatcher
        </Link>
        <Link to="/drivers" className="nav-item">
          <span>👨‍✈️</span> Drivers
        </Link>
        <Link to="/maintenance" className="nav-item">
          <span>🔧</span> Maintenance
        </Link>
        <Link to="/fuel" className="nav-item">
          <span>⛽</span> Fuel & Expenses
        </Link>
        <Link to="/analytics" className="nav-item">
          <span>📈</span> Analytics
        </Link>
      </div>

      <div className="sidebar-footer">
        {user && (
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <span className="user-role">{user.role}</span>
          </div>
        )}
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "dark" ? "🌙" : "☀️"}
        </button>
        <button className="logout-btn" onClick={handleLogout} aria-label="Logout">
          🚪 Logout
        </button>
      </div>
    </nav>
  );
}

export default Sidebar;

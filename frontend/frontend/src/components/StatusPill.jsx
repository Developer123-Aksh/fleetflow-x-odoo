function StatusPill({ status }) {
  const statusMap = {
    available: "Available",
    on_trip: "On Trip",
    in_shop: "In Shop",
    retired: "Retired",
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
    on_duty: "On Duty",
    on_break: "On Break",
    suspended: "Suspended",
    open: "Open",
    resolved: "Resolved",
  };

  const colors = {
    Available: "#10b981",
    "On Trip": "#f59e0b",
    "In Shop": "#ef4444",
    Retired: "#6b7280",
    Pending: "#f59e0b",
    "In Progress": "#3b82f6",
    Completed: "#10b981",
    Cancelled: "#ef4444",
    "On Duty": "#10b981",
    "On Break": "#f59e0b",
    Suspended: "#ef4444",
    Open: "#f59e0b",
    Resolved: "#10b981",
  };

  const displayStatus = statusMap[status] || status || "Unknown";
  const bg = colors[displayStatus] || '#6b7280';

  return (
    <span className="status" style={{ background: bg }}>
      {displayStatus}
    </span>
  );
}

export default StatusPill;

import { Outlet, useNavigate } from "react-router-dom";
import "./dashboard.css";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="dashboard-container">

      {/* SIDEBAR */}
      <div className="sidebar">
        <h2>MJENGOOS</h2>

        <button onClick={() => navigate("/dashboard")}>Dashboard</button>
        <button onClick={() => navigate("/jobs")}>Jobs</button>
        <button onClick={() => navigate("/quotations")}>Quotations</button>
        <button onClick={() => navigate("/projects")}>Projects</button>
        <button onClick={() => navigate("/payments")}>Payments</button>
        <button onClick={() => navigate("/profile")}>Profile</button>

        <button
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
        >
          Logout
        </button>
      </div>

      {/* MAIN */}
      <div className="main">
        <div className="topbar">
          <h3>Welcome back, {user?.username} 👋</h3>
          <p>
            {user?.user_type === "worker"
              ? "Worker Profile"
              : "Customer Profile"}
          </p>
        </div>

        <Outlet />
      </div>
    </div>
  );
}
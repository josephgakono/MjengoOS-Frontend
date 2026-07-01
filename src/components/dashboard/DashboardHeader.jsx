import { PanelLeft } from "lucide-react";

export default function DashboardHeader({ title, subtitle, setSidebarOpen }) {
  return (
    <header className="dashboard-header">
      <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
        <PanelLeft size={28} strokeWidth={2.5} />
      </button>

      <div className="dashboard-header-text">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </header>
  );
}

import Sidebar from "../components/dashboard/Sidebar";
import StatsCards from "../components/dashboard/StatsCards";
import JobsTable from "../components/dashboard/JobsTable";
import ActivityTimeline from "../components/dashboard/ActivityTimeline";
import EscrowOverview from "../components/dashboard/EscrowOverview";
import ProjectsChart from "../components/dashboard/ProjectsChart";
import PostJobModal from "../components/jobs/PostJobModal";
import { useState } from "react";
import "../styles/dashboard.css";
import QuotationsPage from "../components/customer/quotations/QuotationsPage";
// import { Menu } from "lucide-react";
import { PanelLeft } from "lucide-react";

export default function CustomerDashboard() {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <>
      <div className="dashboard-layout">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <main className="dashboard-main">
          {activeTab === "dashboard" && (
            <>
              <header className="dashboard-header">
                <button
                  className="menu-btn"
                  onClick={() => setSidebarOpen(true)}
                >
                 <PanelLeft size={28} strokeWidth={2.5} />
                </button>
                <div>
                  <h1>Customer Dashboard</h1>
                  <p>
                    Manage jobs, quotations, projects, escrow payments and
                    reviews.
                  </p>
                </div>

                <div className="header-user">
                  <img
                    src="https://ui-avatars.com/api/?name=Customer"
                    alt="Profile"
                  />
                  <div>
                    <h4>Customer</h4>
                    <span>MjengoOS User</span>
                  </div>
                </div>
              </header>

              <StatsCards />

              <section className="dashboard-content">
                <div className="content-left">
                  <div className="card">
                    <div className="card-header">
                      <h3>My Jobs</h3>

                      <button
                        className="primary-btn"
                        onClick={() => setShowModal(true)}
                      >
                        + Post New Job
                      </button>
                    </div>

                    <JobsTable />
                  </div>

                  <div className="bottom-grid">
                    <div className="card">
                      <h3>Escrow Overview</h3>
                      <EscrowOverview />
                    </div>

                    <div className="card">
                      <h3>Projects At A Glance</h3>
                      <ProjectsChart />
                    </div>
                  </div>
                </div>

                <div className="content-right">
                  <div className="card activity-card">
                    <h3>Recent Activity</h3>
                    <ActivityTimeline />
                  </div>
                </div>
              </section>
            </>
          )}

          {activeTab === "quotations" && <QuotationsPage />}
        </main>
      </div>
      <PostJobModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onJobCreated={() => {
          window.location.reload();
        }}
      />
    </>
  );
}

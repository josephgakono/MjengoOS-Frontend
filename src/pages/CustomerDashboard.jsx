import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import Profile from "../components/customer/Profile";
import Sidebar from "../components/dashboard/Sidebar";
import StatsCards from "../components/dashboard/StatsCards";
import JobsTable from "../components/dashboard/JobsTable";
import ActivityTimeline from "../components/dashboard/ActivityTimeline";
import EscrowOverview from "../components/dashboard/EscrowOverview";
import ProjectsChart from "../components/dashboard/ProjectsChart";
import PostJobModal from "../components/jobs/PostJobModal";
import "../styles/dashboard.css";
import QuotationsPage from "../components/customer/quotations/QuotationsPage";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardJobs from "../components/customer/DashboardJobs";

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const user = getStoredUser();
    const token = localStorage.getItem("access");

    // Not logged in
    if (!token || !user) {
      navigate("/login", { replace: true });
      return;
    }

    // Only customers can access this dashboard
    if (user.user_type !== "customer") {
      navigate("/login", { replace: true });
      return;
    }

    // Must have an associated customer profile on backend
    const validateProfile = async () => {
      try {
        // Endpoint expected to respond 404/empty if profile missing
        await api.get("customerprofile/");
      } catch (e) {
        navigate("/login", { replace: true });
      }
    };

    validateProfile();
  }, [navigate]);

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
              <DashboardHeader
                title="Customer Dashboard"
                subtitle="Manage jobs, quotations, projects, escrow payments and reviews."
                setSidebarOpen={setSidebarOpen}
              />

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

          {activeTab === "quotations" && (
            <>
              <DashboardHeader
                title="Quotations"
                subtitle="Review and manage quotations from contractors."
                setSidebarOpen={setSidebarOpen}
              />

              <QuotationsPage />
            </>
          )}

          {activeTab === "profile" && (
            <>
              <DashboardHeader
                title="My Profile"
                subtitle="View and manage your account information."
                setSidebarOpen={setSidebarOpen}
              />
              <Profile />
            </>
          )}

          {activeTab === "jobs" && (
            <>
              <DashboardHeader
                title="My Jobs"
                subtitle="Manage all jobs you've posted."
                setSidebarOpen={setSidebarOpen}
              />
              <DashboardJobs />
            </>
          )}
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

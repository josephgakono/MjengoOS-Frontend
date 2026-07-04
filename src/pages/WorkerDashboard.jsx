import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import Sidebar from "../components/dashboard/Sidebar";
import Profile from "../components/worker/Profile";
import DashboardMessages from "../components/customer/DashboardMessages";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import "../styles/dashboard.css";
import WorkerProjects from "../components/worker/projects/WorkerProjects";
import WorkerQuotations from "../components/worker/WorkerQuotations";
import WorkerJobs from "../components/worker/WorkerJobs";
import DashboardPage from "../components/worker/DashboardPage";
import WorkerPayments from "../components/worker/WorkerPayments";

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

export default function WorkerDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access");
    const user = getStoredUser();

    //------------------------------------------------
    // Must be logged in
    //------------------------------------------------

    if (!token || !user) {
      navigate("/login", { replace: true });
      return;
    }

    //------------------------------------------------
    // Only workers
    //------------------------------------------------

    if (user.user_type !== "worker") {
      navigate("/login", { replace: true });
      return;
    }

    //------------------------------------------------
    // Worker profile must exist
    //------------------------------------------------

    const validateProfile = async () => {
      try {
        await api.get("workerprofile/");
      } catch (err) {
        navigate("/login", { replace: true });
      }
    };

    validateProfile();
  }, [navigate]);

  return (
    <div className="dashboard-layout">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <main className="dashboard-main">
        {/* ================= Dashboard ================= */}
        {activeTab === "dashboard" && (
          <DashboardPage setActiveTab={setActiveTab} />
        )}
        {/*================= Available Jobs ================= */}
        {activeTab === "jobs" && (
          <>
            <DashboardHeader
              title="Available Jobs"
              subtitle="Browse jobs available for quotation."
              setSidebarOpen={setSidebarOpen}
            />

            <WorkerJobs />
          </>
        )}
        {/* ================= My Quotations ================= */}
        {activeTab === "quotations" && (
          <>
            <DashboardHeader
              title="My Quotations"
              subtitle="Track quotations you've submitted."
              setSidebarOpen={setSidebarOpen}
            />

            <WorkerQuotations />
          </>
        )}
        {/* ================= Projects ================= */}
        {activeTab === "projects" && (
          <>
            <DashboardHeader
              title="My Projects"
              subtitle="Manage your ongoing and completed projects."
              setSidebarOpen={setSidebarOpen}
            />

            <WorkerProjects />
          </>
        )}
        {/* ================= Payments ================= */}
        {activeTab === "payments" && (
          <>
            <DashboardHeader
              title="Payments"
              subtitle="View deposits, balances and completed payments."
              setSidebarOpen={setSidebarOpen}
            />

            <WorkerPayments />
          </>
        )}
        {/* ================= Messages ================= */}
        {activeTab === "messages" && (
          <>
            <DashboardHeader
              title="Messages"
              subtitle="Chat with customers you've worked with."
              setSidebarOpen={setSidebarOpen}
            />

            <DashboardMessages />
          </>
        )}
        {/* ================= Profile ================= */}
        {activeTab === "profile" && (
          <>
            <DashboardHeader
              title="My Profile"
              subtitle="Manage your worker profile."
              setSidebarOpen={setSidebarOpen}
            />

            <Profile />
          </>
        )}
      </main>
    </div>
  );
}

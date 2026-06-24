import Sidebar from "../components/dashboard/Sidebar"
import StatsCards from "../components/dashboard/StatsCards"
import JobsTable from "../components/dashboard/JobsTable"
import ActivityTimeline from "../components/dashboard/ActivityTimeline"
import EscrowOverview from "../components/dashboard/EscrowOverview"
import ProjectsChart from "../components/dashboard/ProjectsChart"

import "../styles/dashboard.css"

export default function CustomerDashboard() {
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div>
            <h1>Customer Dashboard</h1>
            <p>Manage jobs, quotations, projects, escrow payments and reviews.</p>
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

        {/* Statistics Cards */}
        <StatsCards />

        {/* Main Content */}
        <section className="dashboard-content">
          {/* Left Side */}
          <div className="content-left">
            {/* Jobs Section */}
            <div className="card">
              <div className="card-header">
                <h3>My Jobs</h3>

                <button className="primary-btn">+ Post New Job</button>
              </div>

              <JobsTable />
            </div>

            {/* Bottom Widgets */}
            <div className="bottom-grid">
              <div className="card">
                <div className="card-header">
                  <h3>Escrow Overview</h3>
                </div>

                <EscrowOverview />
              </div>


              <div className="card">
                <div className="card-header">
                  <h3>Projects At A Glance</h3>
                </div>

                <ProjectsChart />
              </div>
            </div>
          </div>


          {/* Right Side */}
          <div className="content-right">
            <div className="card activity-card">
              <div className="card-header">
                <h3>Recent Activity</h3>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
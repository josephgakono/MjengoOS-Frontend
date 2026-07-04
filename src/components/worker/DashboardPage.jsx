import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  CheckCircle2,
  Wallet,
  Star,
  Clock3,
  UserCheck,
  MessageCircle,
  ArrowRight,
} from "lucide-react";

import { api } from "../../services/api";

import "../../styles/WorkerDashboard.css";

export default function DashboardPage({ setActiveTab }) {
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);

  const [projects, setProjects] = useState([]);
  const [payments, setPayments] = useState([]);
  const [messages, setMessages] = useState([]);

  //--------------------------------------------------
  // Load Dashboard
  //--------------------------------------------------

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);

      //----------------------------------
      // Worker Profile
      //----------------------------------

      const workerResponse = await api.get("workerprofile/");

      const worker = Array.isArray(workerResponse)
        ? workerResponse[0]
        : workerResponse;

      setProfile(worker);

      //----------------------------------
      // Everything else
      //----------------------------------

      const [userData, projectResponse, paymentResponse, messageResponse] =
        await Promise.all([
          api.get(`users/${worker.user}/`),
          api.get("projects/"),
          api.get("payments/"),
          api.get("messages/"),
        ]);

      setUser(userData);

      //----------------------------------
      // Projects
      //----------------------------------

      const allProjects = Array.isArray(projectResponse)
        ? projectResponse
        : projectResponse.results || [];

      const myProjects = allProjects.filter(
        (p) => Number(p.worker) === Number(worker.id),
      );

      //----------------------------------
      // Payments
      //----------------------------------

      const allPayments = Array.isArray(paymentResponse)
        ? paymentResponse
        : paymentResponse.results || [];

      const myPayments = allPayments.filter((payment) =>
        myProjects.some((project) => project.id === payment.project),
      );

      //----------------------------------
      // Messages
      //----------------------------------

      const allMessages = Array.isArray(messageResponse)
        ? messageResponse
        : messageResponse.results || [];

      const myMessages = allMessages.filter(
        (message) =>
          Number(message.sender) === Number(worker.user) ||
          Number(message.receiver) === Number(worker.user),
      );

      setProjects(myProjects);

      setPayments(myPayments);

      setMessages(
        myMessages.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
        ),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  //--------------------------------------------------
  // Statistics
  //--------------------------------------------------

  const stats = useMemo(() => {
    const completed = projects.filter((p) => p.status === "completed").length;

    const active = projects.length - completed;

    const earnings = payments
      .filter((p) => p.escrow_status === "released")
      .reduce((sum, payment) => sum + Number(payment.amount), 0);

    const escrow = payments
      .filter((p) => p.escrow_status !== "released")
      .reduce((sum, payment) => sum + Number(payment.amount), 0);

    const completion =
      projects.length === 0
        ? 0
        : Math.round((completed / projects.length) * 100);

    return {
      total: projects.length,
      completed,
      active,
      earnings,
      escrow,
      completion,
    };
  }, [projects, payments]);

  //--------------------------------------------------
  // Profile Completion
  //--------------------------------------------------

  const profileProgress = useMemo(() => {
    if (!profile || !user) return 0;

    let score = 0;

    if (user.profile_picture) score++;
    if (profile.bio) score++;
    if (profile.profession) score++;
    if (profile.location) score++;
    if (profile.hourly_rate > 0) score++;
    if (user.phone) score++;

    return Math.round((score / 6) * 100);
  }, [profile, user]);

  //--------------------------------------------------
  // Current Project
  //--------------------------------------------------

  const currentProject = useMemo(() => {
    return projects.find((p) => p.status !== "completed");
  }, [projects]);

  //--------------------------------------------------
  // Recent Payments
  //--------------------------------------------------

  const recentPayments = payments
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  //--------------------------------------------------
  // Recent Messages
  //--------------------------------------------------

  const recentMessages = messages.slice(0, 5);

  if (loading) {
    return <div className="worker-dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="worker-dashboard">
      {/* Header */}

      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.first_name || user?.username}</h1>

          <p>Here's a quick overview of your work today.</p>
        </div>

        <div className="dashboard-profile">
          {user?.profile_picture ? (
            <img src={user.profile_picture} alt="" />
          ) : (
            <div className="dashboard-avatar">
              {(
                user?.first_name?.[0] ||
                user?.username?.[0] ||
                "U"
              ).toUpperCase()}
            </div>
          )}

          <div>
            <strong>{profile?.profession || "Worker"}</strong>

            <span>{profile?.location || "No location set"}</span>
          </div>
        </div>
      </div>

      {/* Statistics */}

      <div className="dashboard-stats">
        <div className="dashboard-card">
          <BriefcaseBusiness size={20} />
          <h3>{stats.total}</h3>
          <p>Total Projects</p>
          <small>{stats.active} currently active</small>
        </div>

        <div className="dashboard-card">
          <CheckCircle2 size={20} />
          <h3>{stats.completed}</h3>
          <p>Completed</p>
          <small>{stats.completion}% completion rate</small>
        </div>

        <div className="dashboard-card">
          <Wallet size={20} />
          <h3>KES {stats.earnings.toLocaleString()}</h3>
          <p>Total Earnings</p>
          <small>Released payments</small>
        </div>

        <div className="dashboard-card">
          <Clock3 size={20} />
          <h3>KES {stats.escrow.toLocaleString()}</h3>
          <p>Escrow</p>
          <small>Awaiting release</small>
        </div>

        <div className="dashboard-card">
          <Star size={20} />
          <h3>{profile?.average_rating || 0}</h3>
          <p>Performance</p>
          <small>Average customer rating</small>
        </div>
      </div>
      {/* Main Content */}

      <div className="dashboard-grid">
        {/* Performance */}

        <div className="dashboard-panel">
          <div className="panel-header">
            <h2>My Performance</h2>
            <UserCheck size={18} />
          </div>

          <div className="performance-item">
            <span>Average Rating</span>
            <strong>{profile?.average_rating || 0} ★</strong>
          </div>

          <div className="performance-item">
            <span>Verified</span>
            <strong>{profile?.verified ? "Verified ✔" : "Pending"}</strong>
          </div>

          <div className="performance-item">
            <span>Experience</span>
            <strong>{profile?.experience_years || 0} Years</strong>
          </div>

          <div className="performance-item">
            <span>Hourly Rate</span>
            <strong>
              KES {Number(profile?.hourly_rate || 0).toLocaleString()}
            </strong>
          </div>

          <div className="profile-completion">
            <div className="completion-header">
              <span>Profile Completion</span>
              <strong>{profileProgress}%</strong>
            </div>

            <div className="completion-bar">
              <div
                className="completion-fill"
                style={{ width: `${profileProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Current Project */}

        <div className="dashboard-panel">
          <div className="panel-header">
            <h2>Current Project</h2>
          </div>

          {currentProject ? (
            <div className="current-project">
              <h3>Project #{currentProject.id}</h3>

              <p>Started: {currentProject.start_date}</p>

              <p>Expected Finish: {currentProject.expected_completion}</p>

              <span className={`project-status ${currentProject.status}`}>
                {currentProject.status}
              </span>

              <button
                className="dashboard-btn"
                onClick={() => (window.location.href = "/worker/projects")}
              >
                View Project
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="dashboard-empty">No active project.</div>
          )}
        </div>
      </div>

      {/* Bottom Grid */}

      <div className="dashboard-grid">
        {/* Payments */}

        <div className="dashboard-panel">
          <div className="panel-header">
            <h2>Recent Payments</h2>
          </div>

          {recentPayments.length === 0 ? (
            <div className="dashboard-empty">No payments yet.</div>
          ) : (
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Amount</th>
                  <th>Escrow</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {recentPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td>KES {Number(payment.amount).toLocaleString()}</td>

                    <td>{payment.escrow_status}</td>

                    <td>{new Date(payment.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Messages */}

        <div className="dashboard-panel">
          <div className="panel-header">
            <h2>Recent Messages</h2>
            <MessageCircle size={18} />
          </div>

          {recentMessages.length === 0 ? (
            <div className="dashboard-empty">No messages.</div>
          ) : (
            <div className="message-list">
              {recentMessages.map((message) => (
                <div className="message-item" key={message.id}>
                  <div>
                    <p>{message.content}</p>

                    <small>
                      {new Date(message.timestamp).toLocaleString()}
                    </small>
                  </div>

                  {!message.is_read &&
                    Number(message.receiver) === Number(profile.user) && (
                      <span className="message-dot" />
                    )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}

      <div className="dashboard-panel quick-actions">
        <h2>Quick Actions</h2>

      <div className="action-buttons">
    <button onClick={() => setActiveTab("jobs")}>
        Browse Jobs
    </button>

    <button onClick={() => setActiveTab("projects")}>
        My Projects
    </button>

    <button onClick={() => setActiveTab("messages")}>
        Messages
    </button>

    <button onClick={() => setActiveTab("profile")}>
        Edit Profile
    </button>
</div>
      </div>
    </div>
  );
}

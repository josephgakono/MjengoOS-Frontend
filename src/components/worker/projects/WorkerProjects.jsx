import { useEffect, useMemo, useState } from "react";
import {
  Search,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Wallet,
} from "lucide-react";

import { api } from "../../../services/api";

import ProjectModal from "./ProjectModal";

import "../../../styles/WorkerProjects.css";

export default function WorkerProjects() {
  const [loading, setLoading] = useState(true);

  const [projects, setProjects] = useState([]);

  const [search, setSearch] = useState("");

  const [selectedProject, setSelectedProject] = useState(null);

  const [showModal, setShowModal] = useState(false);

  //--------------------------------------------------
  // Load Projects
  //--------------------------------------------------

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    setLoading(true);

    try {
      //-----------------------------------------
      // Logged in worker profile
      //-----------------------------------------

      const workerProfileResponse = await api.get("workerprofile/");

      const workerProfile = Array.isArray(workerProfileResponse)
        ? workerProfileResponse[0]
        : workerProfileResponse;

      //-----------------------------------------
      // Projects
      //-----------------------------------------

      const projectsResponse = await api.get("projects/");

      const allProjects = Array.isArray(projectsResponse)
        ? projectsResponse
        : projectsResponse.results || [];

      //-----------------------------------------
      // My projects only
      //-----------------------------------------

      const myProjects = allProjects.filter(
        (project) => Number(project.worker) === Number(workerProfile.id),
      );

      //-----------------------------------------
      // Attach Job information
      //-----------------------------------------

      const projectsWithJobs = await Promise.all(
        myProjects.map(async (project) => {
          try {
            const job = await api.get(`jobs/${project.job}/`);

            return {
              ...project,
              jobData: job,
            };
          } catch {
            return {
              ...project,
              jobData: null,
            };
          }
        }),
      );

      //-----------------------------------------
      // Sort newest first
      //-----------------------------------------

      projectsWithJobs.sort(
        (a, b) => new Date(b.start_date) - new Date(a.start_date),
      );

      setProjects(projectsWithJobs);
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
    const active = projects.filter((p) => p.status !== "completed").length;

    const completed = projects.filter((p) => p.status === "completed").length;

    const escrowReady = projects.filter(
      (p) => p.payment_received && p.status !== "completed",
    ).length;

    const dueSoon = projects.filter((p) => {
      if (p.status === "completed") return false;

      const today = new Date();

      const due = new Date(p.expected_completion);

      const diff = (due - today) / (1000 * 60 * 60 * 24);

      return diff <= 3;
    }).length;

    return {
      active,
      completed,
      escrowReady,
      dueSoon,
    };
  }, [projects]);

  //--------------------------------------------------
  // Search
  //--------------------------------------------------

  const filteredProjects = useMemo(() => {
    if (!search.trim()) return projects;

    const value = search.toLowerCase();

    return projects.filter((project) => {
      const title = project.jobData?.title?.toLowerCase() || "";

      const description = project.jobData?.description?.toLowerCase() || "";

      const location = project.jobData?.location?.toLowerCase() || "";

      return (
        title.includes(value) ||
        description.includes(value) ||
        location.includes(value)
      );
    });
  }, [projects, search]);

  //--------------------------------------------------
  // Separate Lists
  //--------------------------------------------------

  const activeProjects = filteredProjects.filter(
    (project) => project.status !== "completed",
  );

  const completedProjects = filteredProjects.filter(
    (project) => project.status === "completed",
  );

  //--------------------------------------------------
  // Helpers
  //--------------------------------------------------

  function formatDate(date) {
    if (!date) return "--";

    return new Date(date).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function openProject(project) {
    setSelectedProject(project);
    setShowModal(true);
  }
  //--------------------------------------------------
  // Loading State
  //--------------------------------------------------

  if (loading) {
    return <div className="worker-projects-loading">Loading projects...</div>;
  }

  //--------------------------------------------------
  // JSX
  //--------------------------------------------------

  return (
    <>
      <div className="worker-projects-page">
        {/* Header */}

        <div className="worker-projects-header">
          <div>
            <h2>My Projects</h2>

            <p>
              Manage assigned projects, track progress updates and complete
              work.
            </p>
          </div>
        </div>

        {/* Stats */}

        <div className="worker-projects-stats">
          <div className="project-stat-card">
            <div className="project-stat-icon">
              <BriefcaseBusiness size={22} />
            </div>

            <div>
              <h3>{stats.active}</h3>
              <span>Active Projects</span>
            </div>
          </div>

          <div className="project-stat-card">
            <div className="project-stat-icon completed">
              <CheckCircle2 size={22} />
            </div>

            <div>
              <h3>{stats.completed}</h3>
              <span>Completed</span>
            </div>
          </div>

          <div className="project-stat-card">
            <div className="project-stat-icon due">
              <Clock3 size={22} />
            </div>

            <div>
              <h3>{stats.dueSoon}</h3>
              <span>Due Soon</span>
            </div>
          </div>

          <div className="project-stat-card">
            <div className="project-stat-icon escrow">
              <Wallet size={22} />
            </div>

            <div>
              <h3>{stats.escrowReady}</h3>
              <span>Escrow Ready</span>
            </div>
          </div>
        </div>

        {/* Search */}

        <div className="worker-project-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Active Projects */}

        <section className="projects-section">
          <div className="projects-section-header">
            <h3>Active Projects</h3>

            <span>{activeProjects.length}</span>
          </div>

          {activeProjects.length === 0 ? (
            <div className="projects-empty">
              <h4>No Active Projects</h4>

              <p>Assigned projects will appear here.</p>
            </div>
          ) : (
            <div className="projects-grid">
              {activeProjects.map((project) => (
                <div className="project-card" key={project.id}>
                  <div className="project-card-top">
                    <div>
                      <h4>
                        {project.jobData?.title || `Project #${project.id}`}
                      </h4>

                      <span>{project.jobData?.location || "No location"}</span>
                    </div>

                    <div className="status-badge active">In Progress</div>
                  </div>

                  <div className="project-card-body">
                    <div className="project-row">
                      <span>Start Date</span>

                      <strong>{formatDate(project.start_date)}</strong>
                    </div>

                    <div className="project-row">
                      <span>Expected Completion</span>

                      <strong>{formatDate(project.expected_completion)}</strong>
                    </div>

                    <div className="project-row">
                      <span>Budget</span>

                      <strong>KES {project.jobData?.budget || "0"}</strong>
                    </div>
                  </div>

                  <div className="project-card-footer">
                    {project.payment_received && (
                      <div className="escrow-badge">Escrow Secured</div>
                    )}

                    <button
                      className="project-view-btn"
                      onClick={() => openProject(project)}
                    >
                      View Project
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Completed Projects */}

        <section className="projects-section">
          <div className="projects-section-header">
            <h3>Completed Projects</h3>

            <span>{completedProjects.length}</span>
          </div>

          {completedProjects.length === 0 ? (
            <div className="projects-empty">
              <h4>No Completed Projects</h4>

              <p>Completed projects will appear here.</p>
            </div>
          ) : (
            <div className="projects-grid">
              {completedProjects.map((project) => (
                <div className="project-card completed" key={project.id}>
                  <div className="project-card-top">
                    <div>
                      <h4>
                        {project.jobData?.title || `Project #${project.id}`}
                      </h4>

                      <span>{project.jobData?.location || "No location"}</span>
                    </div>

                    <div className="status-badge completed">Completed</div>
                  </div>

                  <div className="project-card-body">
                    <div className="project-row">
                      <span>Started</span>

                      <strong>{formatDate(project.start_date)}</strong>
                    </div>

                    <div className="project-row">
                      <span>Completed</span>

                      <strong>{formatDate(project.actual_completion)}</strong>
                    </div>

                    <div className="project-row">
                      <span>Budget</span>

                      <strong>KES {project.jobData?.budget || "0"}</strong>
                    </div>
                  </div>

                  <div className="project-card-footer">
                    <button
                      className="project-view-btn"
                      onClick={() => openProject(project)}
                    >
                      View Project
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Project Modal */}

      <ProjectModal
        open={showModal}
        project={selectedProject}
        onClose={() => {
          setShowModal(false);
          setSelectedProject(null);

          // refresh after updates or completion
          loadProjects();
        }}
      />
    </>
  );
}

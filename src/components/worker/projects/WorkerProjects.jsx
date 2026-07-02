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
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

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
    try {
      setLoading(true);

      // Current worker profile

      const workerResponse = await api.get("workerprofile/");

      const worker = Array.isArray(workerResponse)
        ? workerResponse[0]
        : workerResponse;

      // All projects

      const projectsResponse = await api.get("projects/");

      const allProjects = Array.isArray(projectsResponse)
        ? projectsResponse
        : projectsResponse.results || [];

      // Only mine

      const myProjects = allProjects.filter(
        (project) => Number(project.worker) === Number(worker.id),
      );

      // Attach job information

      const data = await Promise.all(
        myProjects.map(async (project) => {
          try {
            const job = await api.get(`jobs/${project.job}/`);

            return {
              ...project,
              job,
            };
          } catch {
            return {
              ...project,
              job: null,
            };
          }
        }),
      );

      data.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));

      setProjects(data);
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
    return {
      total: projects.length,

      active: projects.filter((p) => p.status !== "completed").length,

      completed: projects.filter((p) => p.status === "completed").length,

      escrow: projects.filter(
        (p) => p.payment_received && p.status !== "completed",
      ).length,
    };
  }, [projects]);

  //--------------------------------------------------
  // Search
  //--------------------------------------------------

  const filteredProjects = useMemo(() => {
    if (!search.trim()) return projects;

    const value = search.toLowerCase();

    return projects.filter((project) => {
      const title = project.job?.title?.toLowerCase() || "";

      const location = project.job?.location?.toLowerCase() || "";

      return title.includes(value) || location.includes(value);
    });
  }, [projects, search]);

  //--------------------------------------------------
  // Lists
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

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "--";

  function openProject(project) {
    setSelectedProject(project);
    setShowModal(true);
  }

  if (loading) {
    return <div className="worker-projects-loading">Loading projects...</div>;
  }
  return (
    <>
      <div className="worker-projects-page">
        {/* Stats */}

        <div className="worker-project-stats">
          {[
            {
              title: "Total Projects",
              value: stats.total,
              icon: <BriefcaseBusiness size={20} />,
            },
            {
              title: "Active",
              value: stats.active,
              icon: <Clock3 size={20} />,
            },
            {
              title: "Completed",
              value: stats.completed,
              icon: <CheckCircle2 size={20} />,
            },
            {
              title: "Escrow Holding",
              value: stats.escrow,
              icon: <Wallet size={20} />,
            },
          ].map((card) => (
            <div className="worker-project-stat-card" key={card.title}>
              <div className="icon">{card.icon}</div>

              <div>
                <h4>{card.title}</h4>
                <strong>{card.value}</strong>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}

        <div className="worker-project-search">
          <Search size={18} />

          <input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Lists */}

        <div className="worker-project-columns">
          {/* Active */}

          <div className="project-column">
            <h3>Active Projects ({activeProjects.length})</h3>

            {activeProjects.length === 0 ? (
              <div className="project-empty">No active projects.</div>
            ) : (
              activeProjects.map((project) => (
                <div
                  key={project.id}
                  className="project-card"
                  onClick={() => openProject(project)}
                >
                  <div className="project-card-header">
                    <h4>{project.job?.title || "Untitled Job"}</h4>

                    <span className="status active">Active</span>
                  </div>

                  <p>{project.job?.location}</p>

                  <div className="project-meta">
                    <span>Started: {formatDate(project.start_date)}</span>

                    <span>Due: {formatDate(project.expected_completion)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Completed */}

          <div className="project-column">
            <h3>Completed Projects ({completedProjects.length})</h3>

            {completedProjects.length === 0 ? (
              <div className="project-empty">No completed projects.</div>
            ) : (
              completedProjects.map((project) => (
                <div
                  key={project.id}
                  className="project-card completed"
                  onClick={() => openProject(project)}
                >
                  <div className="project-card-header">
                    <h4>{project.job?.title || "Untitled Job"}</h4>

                    <span className="status completed">Completed</span>
                  </div>

                  <p>{project.job?.location}</p>

                  <div className="project-meta">
                    <span>Started: {formatDate(project.start_date)}</span>

                    <span>
                      Finished: {formatDate(project.actual_completion)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <ProjectModal
        open={showModal}
        project={selectedProject}
        onClose={() => {
          setShowModal(false);
          setSelectedProject(null);
          loadProjects();
        }}
      />
    </>
  );
}

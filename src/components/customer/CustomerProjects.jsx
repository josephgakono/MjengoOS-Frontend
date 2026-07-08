import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Briefcase,
  CheckCircle2,
  ClipboardList,
  Plus,
  MapPin,
  Calendar,
  ChevronRight,
} from "lucide-react";

import { api } from "../../services/api";
import CustomerProjectModal from "./CustomerProjectModal";

import "../../styles/Jobs.css";

export default function CustomerProjects() {

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);


  //-------------------------------------------------
  // Load Projects
  //-------------------------------------------------

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      setLoading(true);

      //-------------------------------------------------
      // Logged in customer
      //-------------------------------------------------

      const currentUser = JSON.parse(localStorage.getItem("user"));

      //-------------------------------------------------
      // Load everything once
      //-------------------------------------------------

      const [projectsResponse, jobsResponse, workersResponse, usersResponse] =
        await Promise.all([
          api.get("projects/"),
          api.get("jobs/"),
          api.get("workerprofile/"),
          api.get("users/"),
        ]);

      const allProjects = Array.isArray(projectsResponse)
        ? projectsResponse
        : projectsResponse.results || [];

      const jobs = Array.isArray(jobsResponse)
        ? jobsResponse
        : jobsResponse.results || [];

      const workerProfiles = Array.isArray(workersResponse)
        ? workersResponse
        : workersResponse.results || [];

      const users = Array.isArray(usersResponse)
        ? usersResponse
        : usersResponse.results || [];

      //-------------------------------------------------
      // Only projects that belong to this customer
      //-------------------------------------------------

      const myProjects = allProjects.filter((project) => {
        const job = jobs.find((j) => j.id === project.job);

        return Number(job?.customer) === Number(currentUser.id);
      });

      //-------------------------------------------------
      // Attach job + worker information
      //-------------------------------------------------

      const mapped = myProjects.map((project) => {
        const job = jobs.find((j) => j.id === project.job);

        const workerProfile = workerProfiles.find(
          (w) => Number(w.id) === Number(project.worker),
        );

        const workerUser = users.find(
          (u) => Number(u.id) === Number(workerProfile?.user),
        );

        return {
          ...project,

          job,

          workerInfo: workerUser
            ? {
                id: workerUser.id,
                username: workerUser.username,
                first_name: workerUser.first_name,
                last_name: workerUser.last_name,
                profile_picture: workerUser.profile_picture || "",
                profession: workerProfile?.profession || "",
              }
            : null,
        };
      });

      mapped.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));

      setProjects(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  //-------------------------------------------------
  // Statistics
  //-------------------------------------------------

  const stats = useMemo(() => {
    return {
      total: projects.length,

      active: projects.filter((p) => p.status !== "completed").length,

      completed: projects.filter((p) => p.status === "completed").length,

      released: projects.filter((p) => p.payment_received).length,
    };
  }, [projects]);

  //-------------------------------------------------
  // Search + Filter
  //-------------------------------------------------

  const filteredProjects = useMemo(() => {
    let list = [...projects];

    if (statusFilter !== "all") {
      list = list.filter((p) => p.status === statusFilter);
    }

    if (search.trim()) {
      const value = search.toLowerCase();

      list = list.filter((project) => {
        return (
          project.job?.title?.toLowerCase().includes(value) ||
          project.job?.location?.toLowerCase().includes(value) ||
          project.workerInfo?.username?.toLowerCase().includes(value)
        );
      });
    }

    return list;
  }, [projects, search, statusFilter]);

  //-------------------------------------------------
  // Helpers
  //-------------------------------------------------

  function openProject(project) {
    setSelectedProject(project);
    setShowModal(true);
  }

  function formatDate(date) {
    if (!date) return "--";

    return new Date(date).toLocaleDateString();
  }

  //-------------------------------------------------
  // Loading
  //-------------------------------------------------

  if (loading) {
    return <div className="jobs-loading">Loading projects...</div>;
  }

  //-------------------------------------------------
  // Split lists
  //-------------------------------------------------

  const activeProjects = filteredProjects.filter((p) => p.status !== "completed");
  const completedProjects = filteredProjects.filter((p) => p.status === "completed");

  //-------------------------------------------------
  // Project Card (Jobs look)
  //-------------------------------------------------

  function ProjectCard({ project, completed }) {
    return (
      <button className="job-item" onClick={() => openProject(project)}>
        <div className="job-item-top">
          <div>
            <h4>{project.job?.title || "Untitled Project"}</h4>

            <div className="job-meta">
              <span>
                <MapPin size={14} />
                {project.job?.location || "Location not provided"}
              </span>

              <span>
                <Calendar size={14} />
                {formatDate(project.start_date)}
              </span>
            </div>
          </div>

          <ChevronRight size={18} />
        </div>

        <div className="job-item-bottom">
          <span className={completed ? "status completed" : "status active"}>
            {completed ? "Completed" : "Active"}
          </span>

          <span className="view-text">View Details</span>
        </div>
      </button>
    );
  }

  //-------------------------------------------------
  // JSX
  //-------------------------------------------------

  return (
    <>
      <div className="jobs-summary">
        <div className="summary-card blue">
          <div>
            <span>Active Projects</span>
            <h2>{activeProjects.length}</h2>
          </div>

          <Briefcase size={34} />
        </div>

        <div className="summary-card purple">
          <div>
            <span>Completed Projects</span>
            <h2>{completedProjects.length}</h2>
          </div>

          <CheckCircle2 size={34} />
        </div>

        <div className="summary-card orange">
          <div>
            <span>Payments Released</span>
            <h2>{stats.released}</h2>
          </div>

          <ClipboardList size={34} />
        </div>
      </div>

      <div className="jobs-container">
        <div className="jobs-header">
          <div>
            <h2>My Projects</h2>
            <p>Manage your created projects and track progress.</p>
          </div>

          <button className="post-job-btn" type="button" disabled>
            <Plus size={18} />
            Projects
          </button>
        </div>

        {/* Search + Filter */}
        <div className="messages-search" style={{ marginBottom: 18 }}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "10px 14px", borderRadius: 12 }}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="jobs-columns">
          <div className="jobs-column">
            <div className="column-header">
              <h3>Active Projects</h3>
              <span>{activeProjects.length}</span>
            </div>

            <div className="jobs-scroll">
              {activeProjects.length > 0 ? (
                activeProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))
              ) : (
                <div className="empty-state">
                  <Briefcase size={44} />
                  <p>No active projects found.</p>
                </div>
              )}
            </div>
          </div>

          <div className="jobs-column">
            <div className="column-header">
              <h3>Completed Projects</h3>
              <span>{completedProjects.length}</span>
            </div>

            <div className="jobs-scroll">
              {completedProjects.length > 0 ? (
                completedProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} completed />
                ))
              ) : (
                <div className="empty-state">
                  <CheckCircle2 size={44} />
                  <p>No completed projects yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CustomerProjectModal
        open={showModal && selectedProject}
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


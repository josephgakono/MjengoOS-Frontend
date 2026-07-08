import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ClipboardList,
  Wallet,
  Search,
  MapPin,
  Calendar,
  Plus,
  FolderKanban,
  CalendarDays,
} from "lucide-react";

import { api } from "../../../services/api";
import ProjectModal from "./ProjectModal";

import "../../../styles/ProjectModal.css";
import "../../../styles/Jobs.css";

export default function WorkerProjects() {
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);

  const [search, setSearch] = useState("");

  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);

  //-------------------------------------------------------
  // LOAD PROJECTS
  //-------------------------------------------------------

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      setLoading(true);

      //---------------------------------------------------
      // Find logged in worker profile
      //---------------------------------------------------

      const workerProfiles = await api.get("workerprofile/");

      const profiles = Array.isArray(workerProfiles)
        ? workerProfiles
        : workerProfiles.results || [];

      const myProfile = profiles.find(
        (profile) => Number(profile.user) === Number(currentUser.id),
      );

      if (!myProfile) {
        setProjects([]);
        return;
      }

      //---------------------------------------------------
      // Load projects
      //---------------------------------------------------

      const projectResponse = await api.get("projects/");

      const allProjects = Array.isArray(projectResponse)
        ? projectResponse
        : projectResponse.results || [];

      const myProjects = allProjects.filter(
        (project) => Number(project.worker) === Number(myProfile.id),
      );

      //---------------------------------------------------
      // Attach Job Information
      //---------------------------------------------------

      const fullProjects = await Promise.all(
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

      fullProjects.sort(
        (a, b) => new Date(b.start_date) - new Date(a.start_date),
      );

      setProjects(fullProjects);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  //-------------------------------------------------------
  // SEARCH
  //-------------------------------------------------------

  const filteredProjects = useMemo(() => {
    if (!search.trim()) return projects;

    const value = search.toLowerCase();

    return projects.filter((project) => {
      const title = project.job?.title?.toLowerCase() || "";
      const location = project.job?.location?.toLowerCase() || "";

      return title.includes(value) || location.includes(value);
    });
  }, [projects, search]);

  //-------------------------------------------------------
  // STATS + SPLIT
  //-------------------------------------------------------

  const stats = useMemo(() => {
    const active = filteredProjects.filter((p) => p.status !== "completed");

    const completed = filteredProjects.filter((p) => p.status === "completed");

    return {
      total: filteredProjects.length,
      active: active.length,
      completed: completed.length,
      escrow: active.filter((p) => p.payment_received).length,
    };
  }, [filteredProjects]);

  const activeProjects = useMemo(
    () => filteredProjects.filter((p) => p.status !== "completed"),
    [filteredProjects],
  );

  const completedProjects = useMemo(
    () => filteredProjects.filter((p) => p.status === "completed"),
    [filteredProjects],
  );

  //-------------------------------------------------------
  // HELPERS
  //-------------------------------------------------------

  function formatDate(date) {
    if (!date) return "--";

    return new Date(date).toLocaleDateString();
  }

  function openProject(project) {
    setSelectedProject(project);
    setShowModal(true);
  }

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

  //-------------------------------------------------------
  // LOADING
  //-------------------------------------------------------

  if (loading) {
    return <div className="jobs-loading">Loading projects...</div>;
  }

  //-------------------------------------------------------
  // JSX
  //-------------------------------------------------------

  return (
    <>
      <div className="jobs-summary">
        <div className="summary-card blue">
          <div>
            <span>Active Projects</span>
            <h2>{activeProjects.length}</h2>
          </div>
          <Clock3 size={34} />
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
            <span>Escrow Holding</span>
            <h2>{stats.escrow}</h2>
          </div>
          <Wallet size={34} />
        </div>
      </div>

      <div className="jobs-container">
        <div className="jobs-header">
          <div>
            <h2>My Projects</h2>
            <p>Manage your assigned projects, upload progress updates.</p>
          </div>

          <button className="post-job-btn" type="button" disabled>
            <Plus size={18} />
            Projects
          </button>
        </div>

        <div className="messages-search" style={{ marginBottom: 18 }}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
                  <Clock3 size={44} />
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
                  <ProjectCard
                    key={project.id}
                    project={project}
                    completed
                  />
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

      <ProjectModal
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


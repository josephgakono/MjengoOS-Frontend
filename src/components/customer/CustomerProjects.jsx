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
  X,
} from "lucide-react";

import { api } from "../../services/api";
import "../../styles/Jobs.css";

export default function CustomerProjects() {
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const [loading, setLoading] = useState(true);

  const [projects, setProjects] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [quotations, setQuotations] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedProject, setSelectedProject] = useState(null);

  const [showDetails, setShowDetails] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const [newProject, setNewProject] = useState({
    job: "",
    start_date: "",
    expected_completion: "",
  });

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      setLoading(true);

      const [projectsRes, jobsRes, workerRes, usersRes, quotationRes] =
        await Promise.all([
          api.get("projects/"),
          api.get("jobs/"),
          api.get("workerprofile/"),
          api.get("users/"),
          api.get("quotations/"),
        ]);

      const projectList = projectsRes.results || projectsRes;
      const jobList = jobsRes.results || jobsRes;
      const workerProfiles = workerRes.results || workerRes;
      const users = usersRes.results || usersRes;
      const quotationList = quotationRes.results || quotationRes;

      const myProjects = projectList
        .filter((project) => {
          const job = jobList.find((j) => j.id === project.job);
          return Number(job?.customer) === Number(currentUser.id);
        })
        .map((project) => {
          const job = jobList.find((j) => j.id === project.job);

          const profile = workerProfiles.find(
            (w) => Number(w.id) === Number(project.worker),
          );

          const user = users.find(
            (u) => Number(u.id) === Number(profile?.user),
          );

          return {
            ...project,
            job,
            workerInfo: user && {
              username: user.username,
              first_name: user.first_name,
              last_name: user.last_name,
              profession: profile?.profession,
            },
          };
        })
        .sort((a, b) => new Date(b.start_date) - new Date(a.start_date));

      setProjects(myProjects);
      setJobs(jobList);
      setWorkers(workerProfiles);
      setQuotations(quotationList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(
    () => ({
      active: projects.filter((p) => p.status !== "completed").length,
      completed: projects.filter((p) => p.status === "completed").length,
      released: projects.filter((p) => p.payment_received).length,
    }),
    [projects],
  );

  const filteredProjects = useMemo(() => {
    let list = [...projects];

    if (statusFilter !== "all") {
      list = list.filter((p) => p.status === statusFilter);
    }

    if (search.trim()) {
      const value = search.toLowerCase();

      list = list.filter(
        (project) =>
          project.job?.title?.toLowerCase().includes(value) ||
          project.job?.location?.toLowerCase().includes(value) ||
          project.workerInfo?.username?.toLowerCase().includes(value),
      );
    }

    return list;
  }, [projects, search, statusFilter]);

  const activeProjects = filteredProjects.filter((p) => p.status !== "completed");
  const completedProjects = filteredProjects.filter(
    (p) => p.status === "completed",
  );

  const availableJobs = jobs.filter((job) => {
    const alreadyExists = projects.some((p) => p.job.id === job.id);

    const accepted = quotations.find(
      (q) => q.job === job.id && q.status === "accepted",
    );

    return (
      Number(job.customer) === Number(currentUser.id) &&
      accepted &&
      !alreadyExists
    );
  });

  const selectedQuotation = quotations.find(
    (q) => q.job === Number(newProject.job) && q.status === "accepted",
  );

  function openProject(project) {
    setSelectedProject(project);
    setShowDetails(true);
  }

  function formatDate(date) {
    return date ? new Date(date).toLocaleDateString() : "--";
  }

  async function createProject(e) {
    e.preventDefault();

    try {
      await api.post("projects/", {
        job: Number(newProject.job),
        worker: selectedQuotation.worker,
        start_date: newProject.start_date,
        expected_completion: newProject.expected_completion,
        status: "pending",
      });

      setShowCreate(false);

      setNewProject({
        job: "",
        start_date: "",
        expected_completion: "",
      });

      loadProjects();
    } catch (err) {
      alert(err.data?.detail || err.message);
    }
  }

  if (loading) {
    return <div className="jobs-loading">Loading projects...</div>;
  }

  function ProjectCard({ project, completed }) {
    return (
      <button className="job-item" onClick={() => openProject(project)}>
        <div className="job-item-top">
          <div>
            <h4>{project.job?.title}</h4>

            <div className="job-meta">
              <span>
                <MapPin size={14} />
                {project.job?.location}
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

  return (
    <>
      <div className="jobs-summary">
        <div className="summary-card blue">
          <div>
            <span>Active Projects</span>
            <h2>{stats.active}</h2>
          </div>

          <Briefcase size={34} />
        </div>

        <div className="summary-card purple">
          <div>
            <span>Completed Projects</span>
            <h2>{stats.completed}</h2>
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
            <p>Track and manage every construction project.</p>
          </div>

          <button className="post-job-btn" onClick={() => setShowCreate(true)}>
            <Plus size={18} />
            Create Project
          </button>
        </div>

        <div className="messages-search" style={{ marginBottom: 18 }}>
          <Search size={18} />

          <input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
            }}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="paused">Paused</option>
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
              {activeProjects.length ? (
                activeProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))
              ) : (
                <div className="empty-state">
                  <Briefcase size={42} />
                  <p>No active projects.</p>
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
              {completedProjects.length ? (
                completedProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    completed
                  />
                ))
              ) : (
                <div className="empty-state">
                  <CheckCircle2 size={42} />
                  <p>No completed projects.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Project Details */}
      {showDetails && selectedProject && (
        <div className="modal-overlay">
          <div className="modal-card">
            <button
              className="close-btn"
              onClick={() => {
                setShowDetails(false);
                setSelectedProject(null);
              }}
            >
              <X size={18} />
            </button>

            <h2>{selectedProject.job?.title}</h2>

            <div className="details-scroll">
              <div className="details-grid">
                <div>
                  <strong>Location</strong>
                  <span>{selectedProject.job?.location}</span>
                </div>

                <div>
                  <strong>Budget</strong>
                  <span>KES {selectedProject.job?.budget}</span>
                </div>

                <div>
                  <strong>Status</strong>
                  <span>{selectedProject.status}</span>
                </div>

                <div>
                  <strong>Worker</strong>
                  <span>
                    {selectedProject.workerInfo?.first_name}{" "}
                    {selectedProject.workerInfo?.last_name}
                  </span>
                </div>

                <div>
                  <strong>Username</strong>
                  <span>@{selectedProject.workerInfo?.username}</span>
                </div>

                <div>
                  <strong>Profession</strong>
                  <span>{selectedProject.workerInfo?.profession}</span>
                </div>

                <div>
                  <strong>Start Date</strong>
                  <span>{formatDate(selectedProject.start_date)}</span>
                </div>

                <div>
                  <strong>Expected Completion</strong>
                  <span>
                    {formatDate(selectedProject.expected_completion)}
                  </span>
                </div>

                <div>
                  <strong>Actual Completion</strong>
                  <span>{formatDate(selectedProject.actual_completion)}</span>
                </div>

                <div>
                  <strong>Payment Released</strong>
                  <span>{selectedProject.payment_received ? "Yes" : "No"}</span>
                </div>

                <div className="full-width">
                  <strong>Description</strong>
                  <p>{selectedProject.job?.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Project */}
      {showCreate && (
        <div className="modal-overlay">
          <form className="modal-card" onSubmit={createProject}>
            <button
              type="button"
              className="close-btn"
              onClick={() => setShowCreate(false)}
            >
              <X size={18} />
            </button>

            <h2>Create Project</h2>

            <label>
              Accepted Job
              <select
                required
                value={newProject.job}
                onChange={(e) =>
                  setNewProject({
                    ...newProject,
                    job: e.target.value,
                  })
                }
              >
                <option value="">Select Job</option>

                {availableJobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Start Date
              <input
                type="date"
                required
                value={newProject.start_date}
                onChange={(e) =>
                  setNewProject({
                    ...newProject,
                    start_date: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Expected Completion
              <input
                type="date"
                required
                value={newProject.expected_completion}
                onChange={(e) =>
                  setNewProject({
                    ...newProject,
                    expected_completion: e.target.value,
                  })
                }
              />
            </label>

            {selectedQuotation && (
              <div
                style={{
                  background: "#f5f7fb",
                  padding: 14,
                  borderRadius: 12,
                  marginBottom: 18,
                }}
              >
                <strong>Assigned Worker</strong>

                <p>Worker ID: {selectedQuotation.worker}</p>

                <p>Quotation Amount: KES {selectedQuotation.amount}</p>

                <p>Estimated Days: {selectedQuotation.estimated_days}</p>
              </div>
            )}

            <button className="post-job-btn" type="submit">
              Create Project
            </button>
          </form>
        </div>
      )}
    </>
  );
}


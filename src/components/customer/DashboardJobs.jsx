import { useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  CheckCircle2,
  ClipboardList,
  Plus,
  MapPin,
  Calendar,
  ChevronRight,
} from "lucide-react";
import JobModal from "../Jobs/JobModal.jsx";
import { api } from "../../services/api";
import "../../styles/Jobs.css";

export default function DashboardJobs({ onPostJob }) {
  //-------------------------------------------------------
  // State
  //-------------------------------------------------------

  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);

  //-------------------------------------------------------
  // Load Jobs
  //-------------------------------------------------------

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    try {
      setLoading(true);

      const data = await api.get("jobs/");

      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }
  function openJob(job) {
    setSelectedJob(job);
    setShowJobModal(true);
  }

  function closeJob() {
    setShowJobModal(false);
    setSelectedJob(null);
  }
  //-------------------------------------------------------
  // Helpers
  //-------------------------------------------------------

  const completedJobs = useMemo(() => {
    return jobs.filter((job) => {
      const status = String(job.status || "").toLowerCase();

      return status === "completed" || status === "complete";
    });
  }, [jobs]);

  const activeJobs = useMemo(() => {
    return jobs.filter((job) => {
      const status = String(job.status || "").toLowerCase();

      return status !== "completed" && status !== "complete";
    });
  }, [jobs]);

  const quotedJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (job.quotation_count) return job.quotation_count > 0;

      if (job.has_quotation) return true;

      if (job.quoted) return true;

      return false;
    });
  }, [jobs]);

  //-------------------------------------------------------
  // Format Date
  //-------------------------------------------------------

  function formatDate(date) {
    if (!date) return "Recently";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  //-------------------------------------------------------
  // Job Card
  //-------------------------------------------------------

  function JobCard({ job, completed }) {
    return (
      <button className="job-item" onClick={() => openJob(job)}>
        
        <div className="job-item-top">
          <div>
            <h4>{job.title}</h4>

            <div className="job-meta">
              <span>
                <MapPin size={14} />

                {job.location || "Location not provided"}
              </span>

              <span>
                <Calendar size={14} />

                {formatDate(job.created_at)}
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
  // Loading
  //-------------------------------------------------------

  if (loading) {
    return <div className="jobs-loading">Loading jobs...</div>;
  }

  //-------------------------------------------------------
  // JSX
  //-------------------------------------------------------

  return (
    <>
      {/*===========================
        Summary Cards
      ============================*/}

      <div className="jobs-summary">
        <div className="summary-card blue">
          <div>
            <span>Active Jobs</span>

            <h2>{activeJobs.length}</h2>
          </div>

          <Briefcase size={34} />
        </div>

        <div className="summary-card purple">
          <div>
            <span>Completed Jobs</span>

            <h2>{completedJobs.length}</h2>
          </div>

          <CheckCircle2 size={34} />
        </div>

        <div className="summary-card orange">
          <div>
            <span>Quoted Jobs</span>

            <h2>{quotedJobs.length}</h2>
          </div>

          <ClipboardList size={34} />
        </div>
      </div>

      {/*===========================
        Jobs Section
      ============================*/}

      <div className="jobs-container">
        <div className="jobs-header">
          <div>
            <h2>My Jobs</h2>

            <p>Manage every construction job you've posted.</p>
          </div>

          <button className="post-job-btn" onClick={onPostJob}>
            <Plus size={18} />
            Post New Job
          </button>
        </div>

        <div className="jobs-columns">
          {/*===========================
            Active Jobs
          ============================*/}

          <div className="jobs-column">
            <div className="column-header">
              <h3>Active Jobs</h3>

              <span>{activeJobs.length}</span>
            </div>

            <div className="jobs-scroll">
              {activeJobs.length > 0 ? (
                activeJobs.map((job) => <JobCard key={job.id} job={job} />)
              ) : (
                <div className="empty-state">
                  <Briefcase size={44} />

                  <p>No active jobs found.</p>
                </div>
              )}
            </div>
          </div>

          {/*===========================
            Completed Jobs
          ============================*/}

          <div className="jobs-column">
            <div className="column-header">
              <h3>Completed Jobs</h3>

              <span>{completedJobs.length}</span>
            </div>

            <div className="jobs-scroll">
              {completedJobs.length > 0 ? (
                completedJobs.map((job) => (
                  <JobCard key={job.id} job={job} completed />
                ))
              ) : (
                <div className="empty-state">
                  <CheckCircle2 size={44} />

                  <p>No completed jobs yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/*====================================
      Future Modal Hook
      ====================================*/}
      <JobModal
    open={showJobModal}
    jobId={selectedJob?.id}
    onClose={closeJob}
/>

      
    </>
  );
}

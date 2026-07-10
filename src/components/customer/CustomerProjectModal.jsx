import { useEffect, useMemo, useState } from "react";
import {
  X,
  Calendar,
  MapPin,
  DollarSign,
  User,
  CheckCircle2,
  Clock3,
  Wallet,
  Image as ImageIcon,
  BriefcaseBusiness,
} from "lucide-react";

import { api } from "../../services/api";

import "../../styles/ProjectModal.css";

export default function CustomerProjectModal({ open, project, onClose }) {
  const [job, setJob] = useState(null);

  const [worker, setWorker] = useState(null);

  const [updates, setUpdates] = useState([]);

  const [loading, setLoading] = useState(true);

  //-------------------------------------------------------
  // Load Data
  //-------------------------------------------------------

  useEffect(() => {
    if (!open || !project) return;

    loadData();
  }, [open, project]);

  async function loadData() {
    try {
      setLoading(true);

      //---------------------------------------
      // Load job + updates
      //---------------------------------------

      const [jobData, updatesResponse] = await Promise.all([
        api.get(`jobs/${project.job}/`),
        api.get("progress-updates/"),
      ]);

      setJob(jobData);

      //---------------------------------------
      // Worker profile
      //---------------------------------------

      let workerProfile = null;

      try {
        workerProfile = await api.get(`workerprofile/${project.worker}/`);
      } catch {}

      //---------------------------------------
      // Worker user
      //---------------------------------------

      let workerUser = null;

      if (workerProfile) {
        try {
          workerUser = await api.get(`users/${workerProfile.user}/`);
        } catch {}
      }

      if (workerUser) {
        setWorker({
          ...workerUser,
          profession: workerProfile.profession,
        });
      }

      //---------------------------------------
      // Progress Updates
      //---------------------------------------

      const allUpdates = Array.isArray(updatesResponse)
        ? updatesResponse
        : updatesResponse.results || [];

      setUpdates(
        allUpdates
          .filter((u) => Number(u.project) === Number(project.id))
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  //-------------------------------------------------------
  // Helpers
  //-------------------------------------------------------

  const completed = project?.status === "completed";

  const progressPercentage = useMemo(() => {
    return Math.min((updates.length / 2) * 100, 100);
  }, [updates]);

  function formatDate(date) {
    if (!date) return "--";

    return new Date(date).toLocaleDateString();
  }

  //-------------------------------------------------------

  if (!open || !project) return null;

  if (loading) {
    return (
      <>
        <div className="project-modal-overlay" onClick={onClose} />

        <div className="project-modal" role="dialog" aria-modal="true">
          Loading...
        </div>
      </>
    );
  }


  //-------------------------------------------------------
  // JSX
  //-------------------------------------------------------

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />

      <div className="project-modal">
        {/* Header */}

      <div className="project-modal-header">
          <div>
            <h2>{job?.title}</h2>

            <p>{job?.location}</p>
          </div>

          <button type="button" onClick={onClose}>
            <X size={22} />
          </button>
        </div>


        <div className="project-modal-body">
          {/* Job Details */}

          <div className="project-section">
            <h3>
              <BriefcaseBusiness size={18} />
              Job Information
            </h3>

            <div className="project-grid">
              <div>
                <Calendar size={18} />

                <strong>Start Date</strong>

                <span>{formatDate(project.start_date)}</span>
              </div>

              <div>
                <Clock3 size={18} />

                <strong>Expected Finish</strong>

                <span>{formatDate(project.expected_completion)}</span>
              </div>

              <div>
                <MapPin size={18} />

                <strong>Location</strong>

                <span>{job?.location}</span>
              </div>

              <div>
                <DollarSign size={18} />

                <strong>Budget</strong>

                <span>KES {job?.budget}</span>
              </div>
            </div>

            <div className="project-description">
              <h4>Description</h4>

              <p>{job?.description}</p>
            </div>
          </div>

          {/* Worker */}

          <div className="project-section">
            <h3>
              <User size={18} />
              Assigned Worker
            </h3>

            {worker ? (
              <div className="worker-card">
                <div className="worker-avatar">
                  {worker.profile_picture ? (
                    <img src={worker.profile_picture} alt="" />
                  ) : (
                    <span>
                      {worker.first_name?.[0]}
                      {worker.last_name?.[0]}
                    </span>
                  )}
                </div>

                <div className="worker-details">
                  <h4>
                    {worker.first_name} {worker.last_name}
                  </h4>

                  <p>@{worker.username}</p>

                  <small>{worker.profession}</small>
                </div>
              </div>
            ) : (
              <div className="project-empty">
                Worker information unavailable.
              </div>
            )}
          </div>

          {/* Project Status */}

          <div className="project-section">
            <h3>
              <CheckCircle2 size={18} />
              Project Status
            </h3>

            <div className="project-status-grid">
              <div>
                <strong>Status</strong>

                <span
                  className={`status ${completed ? "completed" : "active"}`}
                >
                  {project.status}
                </span>
              </div>

              <div>
                <strong>Progress Updates</strong>

                <span>{updates.length}</span>
              </div>

              <div>
                <strong>Payment</strong>

                <span>
                  {project.payment_received ? "Released" : "Held In Escrow"}
                </span>
              </div>
            </div>

            <div className="project-progress">
              <div
                className="project-progress-bar"
                style={{
                  width: `${progressPercentage}%`,
                }}
              />
            </div>

            <small className="project-progress-text">
              {updates.length} progress update
              {updates.length !== 1 && "s"} uploaded
            </small>
          </div>

          {/* Timeline */}

          <div className="project-section">
            <h3>Project Timeline</h3>

            <div className="timeline">
              <div className="timeline-item">
                <span className="timeline-dot" />

                <div>
                  <strong>Started</strong>

                  <p>{formatDate(project.start_date)}</p>
                </div>
              </div>

              <div className="timeline-item">
                <span className="timeline-dot" />

                <div>
                  <strong>Expected Completion</strong>

                  <p>{formatDate(project.expected_completion)}</p>
                </div>
              </div>

              {completed && (
                <div className="timeline-item completed">
                  <span className="timeline-dot success" />

                  <div>
                    <strong>Completed</strong>

                    <p>{formatDate(project.actual_completion)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Progress Updates */}

          <div className="project-section">
            <h3>Progress Updates ({updates.length})</h3>

            {updates.length === 0 ? (
              <div className="project-empty">
                No progress updates uploaded yet.
              </div>
            ) : (
              updates.map((update) => (
                <div className="progress-card" key={update.id}>
                  <div className="progress-header">
                    <strong>
                      {new Date(update.created_at).toLocaleDateString()}
                    </strong>
                  </div>

                  <p>{update.description}</p>

                  {update.image && (
                    <img src={update.image} alt="" className="progress-image" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Escrow */}

          <div className="project-section">
            <h3>
              <Wallet size={18} />
              Payment Status
            </h3>

            <div
              className={`escrow-card ${
                project.payment_received ? "released" : "holding"
              }`}
            >
              {project.payment_received ? (
                <>
                  <h4>Payment Released</h4>

                  <p>
                    The escrow payment has already been released to the worker
                    after successful completion of this project.
                  </p>
                </>
              ) : (
                <>
                  <h4>Payment Secured in Escrow</h4>

                  <p>
                    Funds remain safely held until the worker completes the
                    project and satisfies all completion requirements.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Gallery */}

          {updates.some((u) => u.image) && (
            <div className="project-section">
              <h3>
                <ImageIcon size={18} />
                Project Gallery
              </h3>

              <div className="gallery-grid">
                {updates
                  .filter((u) => u.image)
                  .map((u) => (
                    <img
                      key={u.id}
                      src={u.image}
                      alt=""
                      className="gallery-image"
                    />
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}

        <div className="project-modal-footer">
          {completed ? (
            <div className="project-message success">
              <CheckCircle2 size={18} />

              <span>This project has been completed successfully.</span>
            </div>
          ) : (
            <div className="project-message">
              <Clock3 size={18} />

              <span>This project is currently in progress.</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

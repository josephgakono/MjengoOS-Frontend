import { useEffect, useState } from "react";
import {
  X,
  CalendarDays,
  MapPin,
  User,
  FileText,
  BadgeDollarSign,
  CheckCircle2,
  ImageIcon,
} from "lucide-react";

import { api } from "../../services/api";

import "../../styles/JobModal.css";

export default function JobModal({
  open,
  jobId,
  onClose,
}) {
  const [loading, setLoading] = useState(true);

  const [job, setJob] = useState(null);

  const [budget, setBudget] = useState(null);

  const [updates, setUpdates] = useState([]);

  const [error, setError] = useState("");

  //------------------------------------------------
  // Close with ESC
  //------------------------------------------------

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKey);

    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  //------------------------------------------------
  // Load everything
  //------------------------------------------------

  useEffect(() => {
    if (!open || !jobId) return;

    loadJob();
  }, [open, jobId]);

  //------------------------------------------------
  // Fetch Data
  //------------------------------------------------

  async function loadJob() {
    setLoading(true);

    setError("");

    try {
      //-----------------------------------
      // Job
      //-----------------------------------

      const jobData = await api.get(`jobs/${jobId}/`);

      setJob(jobData);

      //-----------------------------------
      // Accepted quotation
      //-----------------------------------

      const quotations = await api.get("quotations/");

      const accepted = quotations.find(
        (q) =>
          q.job === jobData.id &&
          (q.status === "accepted" || q.accepted === true)
      );

      if (accepted) {
        setBudget(accepted.amount);
      } else {
        setBudget(null);
      }

      //-----------------------------------
      // Progress updates
      //-----------------------------------

      const progress = await api.get("progress-updates/");

      const filtered = progress.filter(
        (item) => item.job === jobData.id
      );

      filtered.sort(
        (a, b) =>
          new Date(b.created_at) -
          new Date(a.created_at)
      );

      setUpdates(filtered);
    } catch (err) {
      console.error(err);

      setError("Unable to load job.");
    } finally {
      setLoading(false);
    }
  }

  //------------------------------------------------
  // Helpers
  //------------------------------------------------

  function formatDate(date) {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(undefined, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function statusClass(status) {
    if (!status) return "active";

    const value = status.toLowerCase();

    if (value.includes("complete")) return "completed";

    if (value.includes("quote")) return "quoted";

    return "active";
  }

  //------------------------------------------------
  // Closed
  //------------------------------------------------

  if (!open) return null;

  //------------------------------------------------
  // JSX
  //------------------------------------------------

  return (
    <>
      <div
        className="job-modal-overlay"
        onClick={onClose}
      />

      <div className="job-modal">
        <button
          className="job-modal-close"
          onClick={onClose}
        >
          <X size={22} />
        </button>

        {loading ? (
          <div className="job-modal-loading">
            Loading job...
          </div>
        ) : error ? (
          <div className="job-modal-error">
            {error}
          </div>
        ) : (
          <>
            {/*========================================*/}
            {/* HEADER */}
            {/*========================================*/}

            <div className="job-modal-header">
              <h2>{job.title}</h2>

              <p>
                Job #{job.id}
              </p>
            </div>

            {/*========================================*/}
            {/* DETAILS */}
            {/*========================================*/}

            <div className="job-info-grid">

              <Info
                icon={<User size={18} />}
                label="Worker"
                value={
                  job.worker_name ||
                  job.worker?.username ||
                  "Not Assigned"
                }
              />

              <Info
                icon={<CalendarDays size={18} />}
                label="Due Date"
                value={formatDate(job.due_date)}
              />

              <Info
                icon={<CheckCircle2 size={18} />}
                label="Status"
                value={
                  <span
                    className={`job-status ${statusClass(
                      job.status
                    )}`}
                  >
                    {job.status}
                  </span>
                }
              />

              <Info
                icon={<MapPin size={18} />}
                label="Location"
                value={
                  job.location || "-"
                }
              />

              <Info
                icon={<BadgeDollarSign size={18} />}
                label="Budget"
                value={
                  budget
                    ? `KES ${Number(
                        budget
                      ).toLocaleString()}`
                    : "No accepted quotation"
                }
              />

            </div>

            {/*========================================*/}
            {/* DESCRIPTION */}
            {/*========================================*/}

            <section className="job-description">
              <h3>
                <FileText size={18} />
                Description
              </h3>

              <p>
                {job.description ||
                  "No description provided."}
              </p>
            </section>

            {/*========================================*/}
            {/* PROGRESS */}
            {/*========================================*/}

            <section className="progress-section">

              <div className="progress-header">
                <h3>
                  Progress Updates
                </h3>

                <span>
                  {updates.length}
                </span>
              </div>

              <div className="progress-list">

                {updates.length === 0 && (
                  <div className="progress-empty">
                    No progress updates yet.
                  </div>
                )}

                {updates.map((update) => (
                  <div
                    key={update.id}
                    className="progress-card"
                  >
                    <div className="progress-card-header">

                      <div>
                        <h4>
                          Update
                        </h4>

                        <span>
                          {formatDate(
                            update.created_at
                          )}
                        </span>
                      </div>

                    </div>

                    {/* Images */}

                    {update.images &&
                      update.images.length >
                        0 && (
                        <div className="progress-gallery">

                          {update.images.map(
                            (
                              image,
                              index
                            ) => (
                              <img
                                key={index}
                                src={image.image}
                                alt=""
                              />
                            )
                          )}

                        </div>
                      )}

                    {/* Optional single image */}

                    {update.image && (
                      <div className="progress-gallery">

                        <img
                          src={update.image}
                          alt=""
                        />

                      </div>
                    )}

                    {!update.image &&
                      !update.images && (
                        <div className="progress-no-image">

                          <ImageIcon size={18} />

                          No images uploaded

                        </div>
                      )}

                    <p>
                      {update.description}
                    </p>

                  </div>
                ))}

              </div>
            </section>
          </>
        )}
      </div>
    </>
  );
}

function Info({
  icon,
  label,
  value,
}) {
  return (
    <div className="job-info-item">

      <div className="job-info-icon">
        {icon}
      </div>

      <div>

        <small>{label}</small>

        <div>{value}</div>

      </div>

    </div>
  );
}
import { useEffect, useState } from "react";
import {
  X,
  User,
  CalendarDays,
  MapPin,
  BadgeDollarSign,
  CheckCircle2,
  FileText,
  ImageIcon,
} from "lucide-react";
import { api } from "../../services/api";
import "../../styles/JobsModal.css";

export default function JobModal({ open, jobId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [budget, setBudget] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const close = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose]);

  useEffect(() => {
    if (!open || !jobId) return;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const [jobData, quotationData, progressData] = await Promise.all([
          api.get(`jobs/${jobId}/`),
          api.get("quotations/"),
          api.get("progress-updates/"),
        ]);

        setJob(jobData);


        const quotations = Array.isArray(quotationData)
          ? quotationData
          : quotationData.results || [];

        const accepted = quotations.find(
          (q) =>
            q.job === jobData.id &&
            (q.status === "accepted" || q.accepted === true)
        );

        setBudget(accepted ? accepted.amount : null);

        const progress = Array.isArray(progressData)
          ? progressData
          : progressData.results || [];

        const filtered = progress
          .filter((u) => u.job === jobData.id)
          .sort(
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

    load();
  }, [jobId, open]);

  function formatDate(date) {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function formatTime(date) {
    if (!date) return "";
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function statusClass(status = "") {
    status = status.toLowerCase();

    if (status.includes("complete")) return "completed";
    if (status.includes("quote")) return "quoted";

    return "active";
  }

  if (!open) return null;

  return (
    <>
      <div className="job-modal-overlay" onClick={onClose}></div>

      <div className="job-modal">

        <button
          className="job-modal-close"
          onClick={onClose}
        >
          <X size={20} />
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
                      {/* ================= HEADER ================= */}

            <div className="job-header">
              <h2>{job.title}</h2>
              <span>Job #{job.id}</span>
            </div>

            {/* ================= DETAILS ================= */}

            <div className="job-details">

              <InfoRow
                icon={<User size={18} />}
                label="Worker"
                value={job.worker_name || job.worker?.username || "Not Assigned"}
              />

              <InfoRow
                icon={<CalendarDays size={18} />}
                label="Due Date"
                value={formatDate(job.due_date)}
              />

              <InfoRow
                icon={<CheckCircle2 size={18} />}
                label="Status"
                value={
                  <span className={`job-status ${statusClass(job.status)}`}>
                    {job.status}
                  </span>
                }
              />

              <InfoRow
                icon={<MapPin size={18} />}
                label="Location"
                value={job.location || "Not Provided"}
              />

              <InfoRow
                icon={<BadgeDollarSign size={18} />}
                label="Budget"
                value={
                  budget
                    ? `KES ${Number(budget).toLocaleString()}`
                    : "No accepted quotation"
                }
              />

            </div>

            {/* ================= DESCRIPTION ================= */}

            <div className="job-section">

              <div className="section-title">
                <FileText size={18}/>
                <span>Description</span>
              </div>

              <p className="job-description">
                {job.description || "No description provided."}
              </p>

            </div>

            {/* ================= PROGRESS ================= */}

            <div className="job-section">

              <div className="section-header">

                <h3>Progress Updates</h3>

                <span>{updates.length}</span>

              </div>

              <div className="progress-list">

                {updates.length === 0 && (

                  <div className="progress-empty">

                    <ImageIcon size={34}/>

                    <p>No progress updates yet.</p>

                  </div>

                )}

                {updates.map((update) => (

                  <div
                    key={update.id}
                    className="progress-item"
                  >

                    <div className="progress-top">

                      <div>

                        <h4>
                          {job.worker_name ||
                           job.worker?.username ||
                           "Worker"}
                        </h4>

                        <span>
                          {formatDate(update.created_at)}
                          {" • "}
                          {formatTime(update.created_at)}
                        </span>

                      </div>

                    </div>

                    <p className="progress-description">
                      {update.description}
                    </p>

                    {(update.image ||
                      (update.images &&
                       update.images.length > 0)) ? (

                      <div className="progress-gallery">

                        {update.image && (
                          <img
                            src={update.image}
                            alt=""
                          />
                        )}

                        {update.images?.map((img,index)=>(
                          <img
                            key={index}
                            src={img.image}
                            alt=""
                          />
                        ))}

                      </div>

                    ) : (

                      <div className="progress-no-image">

                        <ImageIcon size={18}/>

                        <span>No images uploaded</span>

                      </div>

                    )}

                  </div>

                ))}

              </div>

            </div>

          </>
        )}

      </div>

    </>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="job-row">

      <div className="job-row-icon">
        {icon}
      </div>

      <div className="job-row-label">
        {label}
      </div>

      <div className="job-row-value">
        {value}
      </div>

    </div>
  );
}

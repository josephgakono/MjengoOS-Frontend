import { useEffect, useMemo, useState } from "react";
import {
  X,
  Calendar,
  MapPin,
  DollarSign,
  Upload,
  CheckCircle,
  Clock3,
  Image as ImageIcon,
} from "lucide-react";

import { api } from "../../../services/api";

export default function ProjectModal({ open, project, onClose }) {
  const [job, setJob] = useState(null);
  const [updates, setUpdates] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    description: "",
    image: null,
  });

  const [message, setMessage] = useState("");

  //--------------------------------------------------
  // Load Data
  //--------------------------------------------------

  useEffect(() => {
    if (!open || !project) return;

    loadData();
  }, [open, project]);

  async function loadData() {
    try {
      setLoading(true);

      const [jobData, updatesData] = await Promise.all([
        api.get(`jobs/${project.job}/`),
        api.get("progress-updates/"),
      ]);

      const allUpdates = Array.isArray(updatesData)
        ? updatesData
        : updatesData.results || [];

      setJob(jobData);

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

  //--------------------------------------------------
  // Form
  //--------------------------------------------------

  function handleChange(e) {
    const { name, value, files } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  }

  //--------------------------------------------------
  // Submit Progress Update
  //--------------------------------------------------

  async function submitUpdate(e) {
    e.preventDefault();

    if (!form.description.trim()) return;

    try {
      setSaving(true);

      const data = new FormData();

      data.append("description", form.description);

      data.append("project", project.id);

      if (form.image) {
        data.append("image", form.image);
      }

      await api.upload("progress-updates/", data);

      setForm({
        description: "",
        image: null,
      });

      setMessage("Progress update posted.");

      loadData();
    } catch (err) {
      console.error(err);

      setMessage("Unable to upload progress update.");
    } finally {
      setSaving(false);
    }
  }

  //--------------------------------------------------
  // Complete Project
  //--------------------------------------------------

  async function completeProject() {
    if (updates.length < 2) {
      setMessage(
        "You must upload at least two progress updates before completing this project.",
      );

      return;
    }

    try {
      setSaving(true);

      await api.patch(`projects/${project.id}/`, {
        status: "completed",
      });

      setMessage("Project marked as completed.");

      loadData();
    } catch (err) {
      console.error(err);

      setMessage("Unable to complete project.");
    } finally {
      setSaving(false);
    }
  }

  //--------------------------------------------------
  // Helpers
  //--------------------------------------------------

  const completed = project?.status === "completed";

  const paymentReleased = project?.payment_received;

  const progressCount = updates.length;

  if (!open || !project) return null;

  if (loading) {
    return (
      <>
        <div className="modal-overlay" onClick={onClose} />

        <div className="project-modal">Loading...</div>
      </>
    );
  }
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

          <button onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {/* Body */}

        <div className="project-modal-body">
          {/* Job Information */}

          <div className="project-section">
            <h3>Project Details</h3>

            <div className="project-grid">
              <div>
                <Calendar size={18} />
                <strong>Start Date</strong>
                <span>{project.start_date}</span>
              </div>

              <div>
                <Clock3 size={18} />
                <strong>Expected Finish</strong>
                <span>{project.expected_completion}</span>
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
              <h4>Job Description</h4>

              <p>{job?.description}</p>
            </div>
          </div>

          {/* Status */}

          <div className="project-section">
            <h3>Project Status</h3>

            <div className="project-status-grid">
              <div>
                <strong>Status</strong>

                <span
                  className={completed ? "status completed" : "status active"}
                >
                  {project.status}
                </span>
              </div>

              <div>
                <strong>Progress Updates</strong>

                <span>{progressCount}</span>
              </div>

              <div>
                <strong>Payment</strong>

                <span>{paymentReleased ? "Released" : "Held In Escrow"}</span>
              </div>
            </div>
          </div>

          {/* Upload Progress */}

          {!completed && (
            <div className="project-section">
              <h3>Post Progress Update</h3>

              <form onSubmit={submitUpdate}>
                <textarea
                  name="description"
                  placeholder="Describe today's work..."
                  value={form.description}
                  onChange={handleChange}
                  required
                />

                <label className="upload-image-btn">
                  <Upload size={18} />
                  Upload Image
                  <input
                    hidden
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleChange}
                  />
                </label>

                {form.image && <p>{form.image.name}</p>}

                <button className="primary-btn" disabled={saving}>
                  {saving ? "Posting..." : "Post Update"}
                </button>
              </form>
            </div>
          )}

          {/* Progress Updates */}

          <div className="project-section">
            <h3>Progress Updates ({updates.length})</h3>

            {updates.length === 0 ? (
              <div className="project-empty">No progress updates yet.</div>
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
        </div>

        {/* Footer */}

        <div className="project-modal-footer">
          {message && <p className="project-message">{message}</p>}

          {!completed && (
            <>
              {progressCount < 2 && (
                <div className="project-helper">
                  <strong>Before you can complete this project:</strong>

                  <p>
                    Upload at least <strong>2 progress updates</strong>. You
                    have uploaded <strong>{progressCount}</strong> of 2 required
                    updates.
                  </p>
                </div>
              )}

              <button
                className="complete-btn"
                onClick={completeProject}
                disabled={saving || progressCount < 2}
              >
                <CheckCircle size={18} />

                {saving ? "Completing..." : "Mark Project Complete"}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

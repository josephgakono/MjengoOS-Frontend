import { useState } from "react";
import { X } from "lucide-react";
import { api } from "../../services/api";

export default function PostJobModal({ isOpen, onClose, onJobCreated }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    budget: "",
  });

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await api.post("jobs/", formData);

      onJobCreated(response);

      setFormData({
        title: "",
        description: "",
        location: "",
        budget: "",
      });

      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to create job");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="job-modal post-job-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Post New Job</h2>
            <p>Create a job and receive quotations from skilled workers.</p>
          </div>

          <button type="button" className="close-btn" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Job Title</label>

            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  title: e.target.value,
                })
              }
              placeholder="e.g. Build a 3-bedroom house"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>

            <textarea
              rows="4"
              value={formData.description}
              placeholder="Describe your project, materials, expectations and any important details..."
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Location</label>

            <input
              type="text"
              value={formData.location}
              placeholder="e.g. Nairobi, Westlands"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  location: e.target.value,
                })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Budget (KES)</label>

            <input
              type="number"
              value={formData.budget}
              placeholder="e.g. 250000"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  budget: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>

            <button type="submit" className="submit-job-btn" disabled={loading}>
              {loading ? "Posting..." : "Create Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState } from "react";
import { api } from "../../services/api";

export default function PostJobModal({
  isOpen,
  onClose,
  onJobCreated,
}) {
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

      const response = await api.post(
        "jobs/",
        formData
      );

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
    <div className="modal-overlay">
      <div className="job-modal">

        <div className="modal-header">
          <h2>Post New Job</h2>

          <button
            className="close-btn"
            onClick={onClose}
          >
            ✕
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
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>

            <textarea
              rows="4"
              value={formData.description}
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
              onChange={(e) =>
                setFormData({
                  ...formData,
                  budget: e.target.value,
                })
              }
              required
            />
          </div>

          <button
            type="submit"
            className="submit-job-btn"
            disabled={loading}
          >
            {loading
              ? "Posting..."
              : "Create Job"}
          </button>

        </form>
      </div>
    </div>
  );
}
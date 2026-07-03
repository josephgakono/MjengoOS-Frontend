import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Search,
  Clock3,
  CheckCircle2,
  FileText,
  X,
  MapPin,
  DollarSign,
  Calendar,
  Send,
} from "lucide-react";

import { api } from "../../services/api";

import "../../styles/Job.css";

export default function WorkerJobs() {
  //--------------------------------------------------
  // State
  //--------------------------------------------------

  const [loading, setLoading] = useState(true);

  const [jobs, setJobs] = useState([]);

  const [search, setSearch] = useState("");

  const [selectedJob, setSelectedJob] = useState(null);

  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    amount: "",
    estimated_days: "",
    message: "",
  });

  //--------------------------------------------------
  // Load Everything
  //--------------------------------------------------

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const [
        workerResponse,
        jobsResponse,
        quotationsResponse,
        projectsResponse,
      ] = await Promise.all([
        api.get("workerprofile/"),
        api.get("jobs/"),
        api.get("quotations/"),
        api.get("projects/"),
      ]);

      const worker = Array.isArray(workerResponse)
        ? workerResponse[0]
        : workerResponse;

      const jobs = Array.isArray(jobsResponse)
        ? jobsResponse
        : jobsResponse.results || [];

      const quotations = Array.isArray(quotationsResponse)
        ? quotationsResponse
        : quotationsResponse.results || [];

      const projects = Array.isArray(projectsResponse)
        ? projectsResponse
        : projectsResponse.results || [];

      //------------------------------------------------
      // Only my quotations
      //------------------------------------------------

      const myQuotes = quotations.filter(
        (q) => Number(q.worker) === Number(worker.id),
      );

      //------------------------------------------------
      // Merge data
      //------------------------------------------------

      const merged = await Promise.all(
        jobs.map(async (job) => {
          let customer = null;

          try {
            customer = await api.get(`users/${job.customer}/`);
          } catch {}

          const quotation = myQuotes.find(
            (q) => Number(q.job) === Number(job.id),
          );

          const project = projects.find(
            (p) => Number(p.job) === Number(job.id),
          );

          return {
            ...job,
            customer,
            quotation,
            project,
          };
        }),
      );

      merged.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setJobs(merged);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  //--------------------------------------------------
  // Status
  //--------------------------------------------------

  function getStatus(job) {
    if (!job.quotation) return "available";

    if (job.project?.status === "completed") return "completed";

    if (job.project) return "working";

    if (job.quotation.status === "accepted") return "accepted";

    if (job.quotation.status === "rejected") return "rejected";

    return "applied";
  }

  //--------------------------------------------------
  // Statistics
  //--------------------------------------------------

  const stats = useMemo(
    () => ({
      available: jobs.filter((j) => getStatus(j) === "available").length,

      applied: jobs.filter((j) =>
        ["applied", "accepted"].includes(getStatus(j)),
      ).length,

      working: jobs.filter((j) => getStatus(j) === "working").length,

      completed: jobs.filter((j) => getStatus(j) === "completed").length,
    }),
    [jobs],
  );

  //--------------------------------------------------
  // Search
  //--------------------------------------------------

  const filteredJobs = useMemo(() => {
    if (!search.trim()) return jobs;

    const value = search.toLowerCase();

    return jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(value) ||
        job.location.toLowerCase().includes(value) ||
        job.description.toLowerCase().includes(value),
    );
  }, [jobs, search]);

  //--------------------------------------------------
  // Helpers
  //--------------------------------------------------

  function openJob(job) {
    setSelectedJob(job);

    setMessage("");

    setForm({
      amount: "",
      estimated_days: "",
      message: "",
    });
  }

  function closeJob() {
    setSelectedJob(null);

    setMessage("");
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  //--------------------------------------------------
  // Loading
  //--------------------------------------------------

  if (loading) {
    return <div className="jobs-loading">Loading jobs...</div>;
  }
  //--------------------------------------------------
  // Submit Quotation
  //--------------------------------------------------

  async function submitQuotation(e) {
    e.preventDefault();

    if (!form.amount || !form.estimated_days || !form.message.trim()) {
      setMessage("Please fill in all fields.");
      return;
    }

    try {
      setSaving(true);

      await api.post("quotations/", {
        amount: form.amount,
        estimated_days: form.estimated_days,
        message: form.message,
        job: selectedJob.id,
      });

      setMessage("Quotation submitted successfully.");

      await loadData();

      const updated = jobs.find((j) => j.id === selectedJob.id);

      if (updated) setSelectedJob(updated);
    } catch (err) {
      console.error(err);
      setMessage("Unable to submit quotation.");
    } finally {
      setSaving(false);
    }
  }

  //--------------------------------------------------
  // JSX
  //--------------------------------------------------

  return (
    <>
      <div className="worker-jobs-page">
        {/* Statistics */}

        <div className="jobs-stats">
          <div className="stat-card">
            <BriefcaseBusiness size={20} />
            <div>
              <span>Available</span>
              <strong>{stats.available}</strong>
            </div>
          </div>

          <div className="stat-card">
            <FileText size={20} />
            <div>
              <span>Applied</span>
              <strong>{stats.applied}</strong>
            </div>
          </div>

          <div className="stat-card">
            <Clock3 size={20} />
            <div>
              <span>Working</span>
              <strong>{stats.working}</strong>
            </div>
          </div>

          <div className="stat-card">
            <CheckCircle2 size={20} />
            <div>
              <span>Completed</span>
              <strong>{stats.completed}</strong>
            </div>
          </div>
        </div>

        {/* Search */}

        <div className="jobs-search">
          <Search size={18} />

          <input
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}

        <div className="jobs-table-wrapper">
          <table className="jobs-table">
            <thead>
              <tr>
                <th>Job</th>
                <th>Location</th>
                <th>Budget</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredJobs.map((job) => (
                <tr key={job.id} onClick={() => openJob(job)}>
                  <td>{job.title}</td>

                  <td>{job.location}</td>

                  <td>KES {Number(job.budget).toLocaleString()}</td>

                  <td>
                    <span className={`job-status ${getStatus(job)}`}>
                      {getStatus(job)}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredJobs.length === 0 && (
                <tr>
                  <td colSpan="4" className="jobs-empty">
                    No jobs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}

      {selectedJob && (
        <div className="modal-overlay" onClick={closeJob}>
          <div className="job-modal" onClick={(e) => e.stopPropagation()}>
            <div className="job-modal-header">
              <div>
                <h2>{selectedJob.title}</h2>

                <span>{selectedJob.location}</span>
              </div>

              <button onClick={closeJob}>
                <X size={20} />
              </button>
            </div>

            <div className="job-modal-body">
              {/* Job */}

              <div className="job-section">
                <h3>Job Information</h3>

                <p>{selectedJob.description}</p>

                <div className="job-details-grid">
                  <div>
                    <MapPin size={16} />
                    {selectedJob.location}
                  </div>

                  <div>
                    <DollarSign size={16} />
                    KES {Number(selectedJob.budget).toLocaleString()}
                  </div>

                  <div>
                    <Calendar size={16} />
                    {new Date(selectedJob.created_at).toLocaleDateString()}
                  </div>
                </div>

                {selectedJob.image && (
                  <img src={selectedJob.image} className="job-image" alt="" />
                )}
              </div>

              {/* Customer */}

              <div className="job-section">
                <h3>Customer</h3>

                <p>
                  <strong>
                    {selectedJob.customer?.first_name}{" "}
                    {selectedJob.customer?.last_name}
                  </strong>
                </p>

                <p>@{selectedJob.customer?.username}</p>
              </div>

              {/* Quotation */}

              <div className="job-section">
                {!selectedJob.quotation ? (
                  <>
                    <h3>Apply for this Job</h3>

                    <form onSubmit={submitQuotation}>
                      <input
                        type="number"
                        placeholder="Amount"
                        name="amount"
                        value={form.amount}
                        onChange={handleChange}
                      />

                      <input
                        type="number"
                        placeholder="Estimated Days"
                        name="estimated_days"
                        value={form.estimated_days}
                        onChange={handleChange}
                      />

                      <textarea
                        placeholder="Message"
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                      />

                      <button className="primary-btn" disabled={saving}>
                        <Send size={18} />

                        {saving ? "Submitting..." : "Submit Quotation"}
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <h3>Your Quotation</h3>

                    <div className="quotation-info">
                      <p>
                        <strong>Amount:</strong> KES{" "}
                        {Number(selectedJob.quotation.amount).toLocaleString()}
                      </p>

                      <p>
                        <strong>Estimated Days:</strong>{" "}
                        {selectedJob.quotation.estimated_days}
                      </p>

                      <p>
                        <strong>Status:</strong>{" "}
                        <span
                          className={`job-status ${selectedJob.quotation.status}`}
                        >
                          {selectedJob.quotation.status}
                        </span>
                      </p>

                      <p>{selectedJob.quotation.message}</p>

                      {selectedJob.project && (
                        <button className="secondary-btn">
                          Open Current Project
                        </button>
                      )}
                    </div>
                  </>
                )}

                {message && <div className="form-message">{message}</div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

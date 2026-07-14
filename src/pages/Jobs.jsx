import { useEffect, useMemo, useState } from "react";
import {
  Search,
  MapPin,
  Wallet,
  Calendar,
  User,
  Briefcase,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import QuoteModal from "../components/worker/QuoteModal";

export default function Jobs() {
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("user"));

  const user = storedUser || {};

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [showPopup, setShowPopup] = useState(false);

  const [showQuoteModal, setShowQuoteModal] = useState(false);

  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    try {
      setLoading(true);

      const data = await api.get("public/jobs/open/");

      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openQuote(job) {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.user_type !== "worker" && user.user_type !== "contractor") {
      setShowPopup(true);
      return;
    }

    setSelectedJob(job);

    setShowQuoteModal(true);
  }

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const text = (job.title + job.description + job.location).toLowerCase();

      return text.includes(search.toLowerCase());
    });
  }, [jobs, search]);

  return (
    <div className="jobs-page page-with-navbar-offset">
      <div className="page-container">

      {/* HERO */}

      <section className="jobs-hero">
        <h1>Find your next construction job.</h1>

        <p>Browse projects posted by customers across Kenya.</p>

        <div className="jobs-search">
          <Search size={20} />

          <input
            type="text"
            placeholder="Search jobs or locations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      {/* JOBS */}

      <section className="jobs-results">
        <div className="jobs-results-header">
          <h2>{filteredJobs.length} Open Jobs</h2>
        </div>
        {loading ? (
          <div className="jobs-loading">Loading jobs...</div>
        ) : filteredJobs.length === 0 ? (
          <div className="jobs-empty">
            <Briefcase size={70} />

            <h3>No jobs found</h3>

            <p>Try changing your search.</p>
          </div>
        ) : (
          <div className="jobs-grid">
            {filteredJobs.map((job) => (
              <article key={job.id} className="job-card-home">
                {job.image && (
                  <img src={job.image} alt={job.title} className="job-image" />
                )}

                <div className="job-body">
                  <div className="job-top">
                    <span className="job-open">{job.status.toUpperCase()}</span>

                    <span className="job-budget">
                      KES {Number(job.budget).toLocaleString()}
                    </span>
                  </div>

                  <h3>{job.title}</h3>

                  <p className="job-description">
                    {job.description.length > 170
                      ? job.description.slice(0, 170) + "..."
                      : job.description}
                  </p>

                  <div className="job-meta">
                    <span>
                      <MapPin size={16} />
                      {job.location}
                    </span>

                    <span>
                      <Wallet size={16} />
                      Budget
                    </span>
                  </div>

                  <div className="job-footer">
                    <div>
                      <User size={16} />
                      Customer #{job.customer}
                    </div>

                    <div>
                      <Calendar size={16} />
                      {new Date(job.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <button className="apply-btn" onClick={() => openQuote(job)}>
                    {!user
                      ? "Login to Quote"
                      : user.user_type === "worker" ||
                          user.user_type === "contractor"
                        ? "Quote for this Job"
                        : "Only Workers Can Quote"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Worker Required Popup */}

      {showPopup && (
        <div
          className="quote-popup-overlay"
          onClick={() => setShowPopup(false)}
        >
          <div className="quote-popup" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={() => setShowPopup(false)}>
              <X size={20} />
            </button>

            <h2>Worker Account Required</h2>

            <p>Only workers and contractors can submit quotations for jobs.</p>

            <button className="apply-btn" onClick={() => setShowPopup(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      <QuoteModal
        open={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        job={selectedJob}
        workerId={user?.worker_profile_id}
        onSuccess={fetchJobs}
      />
        </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  MapPin,
  Wallet,
  Calendar,
  User,
  Briefcase,
} from "lucide-react";

import { api } from "../services/api";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

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

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const text = (
        job.title +
        job.description +
        job.location +
        job.customer_username
      ).toLowerCase();

      return text.includes(search.toLowerCase());
    });
  }, [jobs, search]);

  return (
    <div className="jobs-page">

      {/* HERO */}

      <section className="jobs-hero">

        <h1>
          Find your next construction job.
        </h1>

        <p>
          Browse projects posted by customers across Kenya.
        </p>

        <div className="jobs-search">

          <Search size={20} />

          <input
            type="text"
            placeholder="Search jobs, locations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

      </section>

      {/* RESULTS */}

      <section className="jobs-results">

        <div className="jobs-results-header">

          <h2>

            {filteredJobs.length} Open Jobs

          </h2>

        </div>

        {loading ? (

          <div className="jobs-loading">

            Loading jobs...

          </div>

        ) : filteredJobs.length === 0 ? (

          <div className="jobs-empty">

            <Briefcase size={70} />

            <h3>No jobs found</h3>

            <p>

              Try changing your search.

            </p>

          </div>

        ) : (

          <div className="jobs-grid">

            {filteredJobs.map((job) => (

              <article
                key={job.id}
                className="job-card-home"
              >

                {job.image && (
                  <img
                    src={job.image}
                    alt={job.title}
                    className="job-image"
                  />
                )}

                <div className="job-body">

                  <div className="job-top">

                    <span className="job-open">

                      OPEN

                    </span>

                    <span className="job-budget">

                      KES {Number(job.budget).toLocaleString()}

                    </span>

                  </div>

                  <h3>

                    {job.title}

                  </h3>

                  <p className="job-description">

                    {job.description.length > 170
                      ? job.description.slice(0,170)+"..."
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

                      {job.customer_username}

                    </div>

                    <div>

                      <Calendar size={16} />

                      {new Date(
                        job.created_at
                      ).toLocaleDateString()}

                    </div>

                  </div>

                  <button
                    className="apply-btn"
                  >
                    Login to Quote
                  </button>

                </div>

              </article>

            ))}
          </div>

        )}

      </section>

    </div>
  );
}
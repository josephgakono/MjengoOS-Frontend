import { useEffect, useMemo, useState } from "react";
import {
  Star,
  Eye,
  ClipboardCheck,
  MessageSquare,
  PenSquare,
  X,
} from "lucide-react";
import { api } from "../../services/api";
import "../../styles/CustomerReviews.css";

export default function CustomerReviews() {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [projects, setProjects] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [reviewProject, setReviewProject] = useState(null);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({
    rating: 5,
    comment: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [reviewsData, projectsData, jobsData] = await Promise.all([
        api.get("reviews/"),
        api.get("projects/"),
        api.get("jobs/"),
      ]);

      const workerProfiles = await Promise.all(
        projectsData.map((project) =>
          api.get(`workerprofile/${project.worker}/`),
        ),
      );

      const workersData = await Promise.all(
        workerProfiles.map(async (worker) => {
          const user = await api.get(`users/${worker.user}/`);

          return {
            ...worker,
            full_name: `${user.first_name} ${user.last_name}`,
            username: user.username,
          };
        }),
      );

      setReviews(reviewsData);
      setProjects(projectsData);
      setJobs(jobsData);
      setWorkers(workersData);
    } catch (err) {
      console.error(err);
      console.log(err.data);

      alert(err.data?.detail || JSON.stringify(err.data) || err.message);
    } finally {
      setLoading(false);
    }
  }

  /* ---------------- Maps ---------------- */

  const jobsMap = useMemo(() => {
    const map = {};
    jobs.forEach((job) => (map[job.id] = job));
    return map;
  }, [jobs]);

  const workersMap = useMemo(() => {
    const map = {};
    workers.forEach((worker) => (map[worker.id] = worker));
    return map;
  }, [workers]);

  const reviewedProjects = useMemo(
    () => reviews.map((r) => r.project),
    [reviews],
  );

  const pendingProjects = projects.filter(
    (p) => p.status === "completed" && !reviewedProjects.includes(p.id),
  );

  const filteredReviews = reviews.filter((review) => {
    if (filter === "all") return true;
    return review.rating === Number(filter);
  });

  async function submitReview(e) {
    e.preventDefault();

    try {
      await api.post("reviews/", {
        project: reviewProject.id,
        worker: reviewProject.worker,
        rating: form.rating,
        comment: form.comment,
      });
      alert("Review submitted successfully.");

      setReviewProject(null);

      setForm({
        rating: 5,
        comment: "",
      });

      loadData();
    } catch (err) {
      console.error(err);
      console.log(err.data);

      alert(err.data?.detail || JSON.stringify(err.data) || err.message);
  }
}

  if (loading) return <p>Loading reviews...</p>;

  return (
    <div className="customer-reviews">
      {/* Summary */}

      <div className="review-summary">
        <div className="summary-card">
          <Star size={22} />
          <div>
            <span>Reviews Given</span>
            <h3>{reviews.length}</h3>
          </div>
        </div>

        <div className="summary-card">
          <ClipboardCheck size={22} />
          <div>
            <span>Completed Projects</span>
            <h3>
              {
                projects.filter((project) => project.status === "completed")
                  .length
              }
            </h3>
          </div>
        </div>

        <div className="summary-card">
          <PenSquare size={22} />
          <div>
            <span>Pending Reviews</span>
            <h3>{pendingProjects.length}</h3>
          </div>
        </div>
      </div>

      {/* Toolbar */}

      <div className="reviews-toolbar">
        <h2>Worker Reviews</h2>

        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Reviews</option>
          <option value="5">★★★★★</option>
          <option value="4">★★★★☆</option>
          <option value="3">★★★☆☆</option>
          <option value="2">★★☆☆☆</option>
          <option value="1">★☆☆☆☆</option>
        </select>
      </div>

      {/* Review Grid */}

      <div className="reviews-grid">
        {filteredReviews.map((review) => {
          const project = projects.find((p) => p.id === review.project);
          const job = jobsMap[project?.job];
          const worker = workersMap[project?.worker];

          return (
            <div key={review.id} className="review-card">
              <div className="review-stars">
                {"★".repeat(review.rating)}
                {"☆".repeat(5 - review.rating)}
              </div>

              <h3>{worker?.full_name || "Unknown Worker"}</h3>

              <small>@{worker?.username}</small>

              <p className="review-profession">
                {worker?.profession || "Worker"}
              </p>

              <strong>{job?.title}</strong>

              <p className="review-comment">{review.comment}</p>

              <div className="review-footer">
                <span>{review.created_at}</span>

                <button onClick={() => setSelected(review)}>
                  <Eye size={16} />
                  View
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pending Reviews */}

      {pendingProjects.length > 0 && (
        <>
          <h2 className="pending-title">Pending Reviews</h2>

          <div className="reviews-grid">
            {pendingProjects.map((project) => {
              const job = jobsMap[project.job];
              const worker = workersMap[project.worker];

              return (
                <div key={project.id} className="review-card pending-card">
                  <ClipboardCheck size={28} />

                  <h3>{job?.title}</h3>

                  <p>
                    {worker?.full_name}
                    <br />
                    <small>@{worker?.username}</small>
                  </p>

                  <span>{worker?.profession}</span>

                  <button
                    className="leave-review-btn"
                    onClick={() => setReviewProject(project)}
                  >
                    <MessageSquare size={16} />
                    Leave Review
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* View Review */}

      {selected && (
        <div className="customer-review-modal" onClick={() => setSelected(null)}>
          <div
            className="customer-review-card"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="customer-review-close"
              onClick={() => setSelected(null)}
              type="button"
              aria-label="Close review details"
            >
              <X size={18} />
            </button>

            {(() => {
              const project = projects.find((p) => p.id === selected.project);

              const job = jobsMap[project?.job];
              const worker = workersMap[project?.worker];

              return (
                <>
                  <h2>Review Details</h2>

                  <div className="customer-review-details">
                    <div>
                      <strong>Worker</strong>
                      <span>{worker?.full_name}</span>
                    </div>

                    <div>
                      <strong>Username</strong>
                      <span>@{worker?.username}</span>
                    </div>

                    <div>
                      <strong>Profession</strong>
                      <span>{worker?.profession}</span>
                    </div>

                    <div>
                      <strong>Project</strong>
                      <span>{job?.title}</span>
                    </div>

                    <div>
                      <strong>Rating</strong>
                      <span className="customer-review-rating">
                        {selected.rating} / 5
                      </span>
                    </div>

                    <div>
                      <strong>Date</strong>
                      <span>{selected.created_at}</span>
                    </div>

                    <div className="customer-review-comment">
                      <strong>Comment</strong>

                      <p>{selected.comment}</p>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Leave Review */}

      {reviewProject && (
        <div
          className="customer-review-modal"
          onClick={() => setReviewProject(null)}
        >
          <form
            className="customer-review-card customer-review-form"
            onSubmit={submitReview}
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="customer-review-close"
              onClick={() => setReviewProject(null)}
              aria-label="Close leave review form"
            >
              <X size={18} />
            </button>

            <h2>Leave Review</h2>

            <label>
              Rating
              <select
                value={form.rating}
                onChange={(e) =>
                  setForm({
                    ...form,
                    rating: Number(e.target.value),
                  })
                }
              >
                {[5, 4, 3, 2, 1].map((star) => (
                  <option key={star} value={star}>
                    {star} Star{star > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Comment
              <textarea
                rows="5"
                placeholder="Share your experience..."
                value={form.comment}
                onChange={(e) =>
                  setForm({
                    ...form,
                    comment: e.target.value,
                  })
                }
                required
              />
            </label>

            <button className="submit-review-btn" type="submit">
              Submit Review
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Star, Search, ShieldCheck, MessageSquare, X } from "lucide-react";

import { api } from "../../services/api";

import "../../styles/WorkerReviews.css";

export default function WorkerReviews() {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState("");

  // Used for popup
  const [selectedReview, setSelectedReview] = useState(null);

  //-------------------------------------------------
  // Load Everything
  //-------------------------------------------------

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const workerProfile = await api.get("workerprofile/");

      const worker = Array.isArray(workerProfile)
        ? workerProfile[0]
        : workerProfile;

      const [
        reviewResponse,
        projectResponse,
        jobResponse,
        customerProfiles,
        users,
      ] = await Promise.all([
        api.get("reviews/"),
        api.get("projects/"),
        api.get("jobs/"),
        api.get("customerprofile/"),
        api.get("users/"),
      ]);

      const reviewList = Array.isArray(reviewResponse)
        ? reviewResponse
        : reviewResponse.results || [];

      const projects = Array.isArray(projectResponse)
        ? projectResponse
        : projectResponse.results || [];

      const jobs = Array.isArray(jobResponse)
        ? jobResponse
        : jobResponse.results || [];

      const customers = Array.isArray(customerProfiles)
        ? customerProfiles
        : customerProfiles.results || [];

      const userList = Array.isArray(users) ? users : users.results || [];

      //-------------------------------------------------
      // Join Related Data
      //-------------------------------------------------

      const data = reviewList
        .filter((r) => Number(r.worker) === Number(worker.id))
        .map((review) => {
          const project = projects.find((p) => p.id === review.project);

          const job = jobs.find((j) => j.id === project?.job);
const customer = customers.find(
  (c) => Number(c.user) === Number(review.customer)
);

return {
  ...review,
  project,
  job,
  customer,
  fullName: customer
    ? `${customer.first_name} ${customer.last_name}`
    : "Unknown Customer",

  date: new Date(review.created_at).toLocaleDateString(),
};
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  //-------------------------------------------------
  // Worker Profile
  //-------------------------------------------------

  const workerInfo = useMemo(() => {
    if (!reviews.length)
      return {
        rating: 0,
        verified: false,
      };

    return {
      rating: reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length,

      verified: true,
    };
  }, [reviews]);

  //-------------------------------------------------
  // Statistics
  //-------------------------------------------------

  const stats = useMemo(() => {
    const count = (value) => reviews.filter((r) => r.rating === value).length;

    return {
      total: reviews.length,
      five: count(5),
      four: count(4),
      three: count(3),
      two: count(2),
      one: count(1),
    };
  }, [reviews]);

  //-------------------------------------------------
  // Search
  //-------------------------------------------------

  const filteredReviews = useMemo(() => {
    if (!search.trim()) return reviews;

    const value = search.toLowerCase();

    return reviews.filter((review) => {
      return (
        review.fullName.toLowerCase().includes(value) ||
        review.customer?.username?.toLowerCase().includes(value) ||
        review.job?.title?.toLowerCase().includes(value) ||
        review.comment?.toLowerCase().includes(value)
      );
    });
  }, [reviews, search]);

  //-------------------------------------------------
  // Helpers
  //-------------------------------------------------

  function initials(user) {
    if (!user) return "?";

    return (
      (user.first_name?.[0] || "") + (user.last_name?.[0] || "")
    ).toUpperCase();
  }

  function ratingLabel(rating) {
    return (
      {
        5: "Excellent",
        4: "Very Good",
        3: "Good",
        2: "Needs Improvement",
        1: "Poor",
      }[rating] || ""
    );
  }

  if (loading) {
    return <div className="worker-reviews-loading">Loading reviews...</div>;
  }
  return (
    <>
      <div className="worker-reviews">
        {/* Summary */}

        <div className="review-summary">
          <div className="review-summary-card">
            <Star size={20} />

            <div>
              <h4>Average Rating</h4>
              <strong>{workerInfo.rating.toFixed(1)}</strong>
            </div>
          </div>

          <div className="review-summary-card">
            <MessageSquare size={20} />

            <div>
              <h4>Total Reviews</h4>
              <strong>{stats.total}</strong>
            </div>
          </div>

          <div className="review-summary-card">
            <ShieldCheck size={20} />

            <div>
              <h4>Verification</h4>
              <strong>{workerInfo.verified ? "Verified" : "Pending"}</strong>
            </div>
          </div>
        </div>

        {/* Search */}

        <div className="review-search">
          <Search size={18} />

          <input
            placeholder="Search customer, job or review..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Rating Distribution */}

        <div className="rating-distribution">
          {[
            [5, stats.five],
            [4, stats.four],
            [3, stats.three],
            [2, stats.two],
            [1, stats.one],
          ].map(([star, total]) => (
            <div key={star} className="rating-row">
              <span>{star} ★</span>

              <div className="rating-bar">
                <div
                  style={{
                    width: `${stats.total ? (total / stats.total) * 100 : 0}%`,
                  }}
                />
              </div>

              <strong>{total}</strong>
            </div>
          ))}
        </div>

        {/* Review Cards */}

        <div className="review-grid">
          {filteredReviews.length === 0 ? (
            <div className="review-empty">No reviews found.</div>
          ) : (
            filteredReviews.map((review) => (
              <div
                key={review.id}
                className="review-card"
                onClick={() => setSelectedReview(review)}
              >
                <div className="review-user">
                  {review.customer?.profile_picture ? (
                    <img src={review.customer.profile_picture} alt="" />
                  ) : (
                    <div className="review-avatar">
                      {initials(review.customer)}
                    </div>
                  )}

                  <div>
                    <h4>{review.fullName}</h4>

                    <span>@{review.customer?.username}</span>
                  </div>
                </div>

                <div className="review-stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={i < review.rating ? "#fbbf24" : "none"}
                      color="#fbbf24"
                    />
                  ))}
                </div>

                <span className="review-job">{review.job?.title}</span>

                <p className="review-comment">{review.comment}</p>

                <div className="review-footer">
                  <small>{review.date}</small>

                  <span className="completed-tag">Completed ✓</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}

      {selectedReview && (
        <div
          className="review-modal-overlay"
          onClick={() => setSelectedReview(null)}
        >
          <div
            className="review-modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="review-modal-header">
              <h2>Review Details</h2>

              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                aria-label="Close review details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="review-modal-body">
              <div className="review-user">
                {selectedReview.customer?.profile_picture ? (
                  <img src={selectedReview.customer.profile_picture} alt="" />
                ) : (
                  <div className="review-avatar">
                    {initials(selectedReview.customer)}
                  </div>
                )}

                <div>
                  <h3>{selectedReview.fullName}</h3>

                  <p>@{selectedReview.customer?.username}</p>
                </div>
              </div>

              <div className="review-details">
                <div>
                  <label>Job</label>
                  <strong>{selectedReview.job?.title}</strong>
                </div>

                <div>
                  <label>Location</label>
                  <strong>{selectedReview.job?.location}</strong>
                </div>

                <div>
                  <label>Budget</label>
                  <strong>KES {selectedReview.job?.budget}</strong>
                </div>

                <div>
                  <label>Project Status</label>
                  <strong>{selectedReview.project?.status}</strong>
                </div>

                <div>
                  <label>Rating</label>

                  <strong>
                    {selectedReview.rating} ★ (
                    {ratingLabel(selectedReview.rating)})
                  </strong>
                </div>

                <div>
                  <label>Reviewed On</label>
                  <strong>{selectedReview.date}</strong>
                </div>
              </div>

              <div className="review-comment-box">
                <h4>Customer Review</h4>

                <p>{selectedReview.comment}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

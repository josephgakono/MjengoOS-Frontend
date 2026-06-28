import { useState } from "react";
import {
  X,
  MapPin,
  Calendar,
  Clock3,
  BadgeCheck,
  Star,
  Briefcase,
  Wallet,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { api } from "../../../services/api";
import "../../../styles/quotationModal.css";

export default function QuotationModal({
  quotation,
  isOpen,
  onClose,
  onUpdated,
}) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !quotation) return null;

  const {
    id,
    amount,
    estimated_days,
    message,
    status,
    created_at,
    worker,
    job,
  } = quotation;

  //------------------------------------------------
  // Helpers
  //------------------------------------------------

  const avatar =
    worker?.user?.profile_picture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      worker?.user?.username || "Worker",
    )}&background=634ce7&color=fff`;

  const rating = worker?.average_rating
    ? Number(worker.average_rating).toFixed(1)
    : "0.0";

  const budget = Number(job?.budget || 0);
  const quotationAmount = Number(amount || 0);

  const difference = budget - quotationAmount;
  const withinBudget = difference >= 0;

  function badgeClass() {
    switch (status) {
      case "accepted":
        return "accepted";

      case "rejected":
        return "rejected";

      default:
        return "pending";
    }
  }

  //------------------------------------------------
  // Accept quotation
  //------------------------------------------------

  async function acceptQuotation() {
    if (!window.confirm("Accept this quotation?")) return;

    try {
      setLoading(true);

      await api.post(`quotations/${id}/accept/`);

      onUpdated?.();

      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to accept quotation.");
    } finally {
      setLoading(false);
    }
  }

  //------------------------------------------------
  // Reject quotation
  //------------------------------------------------

  async function rejectQuotation() {
    if (!window.confirm("Reject this quotation?")) return;

    try {
      setLoading(true);

      await api.post(`quotations/${id}/reject/`);

      onUpdated?.();

      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to reject quotation.");
    } finally {
      setLoading(false);
    }
  }

  //------------------------------------------------
  // JSX
  //------------------------------------------------

  return (
    <div className="quote-modal-overlay" onClick={onClose}>
      <div className="quote-modal" onClick={(e) => e.stopPropagation()}>
        {/* ================= HEADER ================= */}

        <div className="quote-modal-header">
          <div>
            <h2>Quotation Details</h2>

            <p>Carefully review the quotation before making your decision.</p>
          </div>

          <button className="close-modal-btn" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {/* ================= TOP GRID ================= */}

        <div className="quote-top-grid">
          {/* Worker Card */}

          <div className="worker-card">
            <div className="worker-header">
              <img
                src={avatar}
                alt={worker?.user?.username}
                className="worker-avatar"
              />

              <div className="worker-basic">
                <div className="worker-name-row">
                  <h3>{worker?.user?.username}</h3>

                  {worker?.verified && (
                    <span className="verified-badge">
                      <BadgeCheck size={16} />
                      Verified
                    </span>
                  )}
                </div>

                <p className="worker-profession">
                  <Briefcase size={16} />
                  {worker?.profession}
                </p>
              </div>
            </div>

            <div className="worker-stats">
              <div className="worker-stat">
                <Star size={16} />
                <span>{rating}</span>
              </div>

              <div className="worker-stat">
                <Clock3 size={16} />
                <span>{worker?.experience_years} years</span>
              </div>

              <div className="worker-stat">
                <MapPin size={16} />
                <span>{worker?.location}</span>
              </div>

              <div className="worker-stat">
                <Wallet size={16} />
                <span>
                  KES {Number(worker?.hourly_rate || 0).toLocaleString()}/hr
                </span>
              </div>
            </div>
          </div>

          {/* Job Card */}

          <div className="job-card">
            <h3>Job Information</h3>

            <div className="job-info">
              <div>
                <span>Title</span>
                <strong>{job?.title}</strong>
              </div>

              <div>
                <span>Location</span>
                <strong>{job?.location}</strong>
              </div>

              <div>
                <span>Budget</span>
                <strong>KES {budget.toLocaleString()}</strong>
              </div>

              <div>
                <span>Posted</span>
                <strong>
                  {new Date(job?.created_at).toLocaleDateString()}
                </strong>
              </div>
            </div>

            <div className="job-description">
              <h4>Description</h4>

              <p>{job?.description}</p>
            </div>
          </div>
        </div>
        {/* ================= QUOTATION SUMMARY ================= */}

        <div className="quotation-summary-card">
          <div className="summary-header">
            <h3>Quotation Summary</h3>

            <span className={`quotation-status ${badgeClass()}`}>{status}</span>
          </div>

          <div className="summary-grid">
            <div className="summary-item">
              <span>Quoted Amount</span>

              <strong>KES {quotationAmount.toLocaleString()}</strong>
            </div>

            <div className="summary-item">
              <span>Estimated Duration</span>

              <strong>{estimated_days} Days</strong>
            </div>

            <div className="summary-item">
              <span>Submitted</span>

              <strong>{new Date(created_at).toLocaleDateString()}</strong>
            </div>

            <div className="summary-item">
              <span>Budget Difference</span>

              <strong className={withinBudget ? "budget-good" : "budget-high"}>
                {withinBudget ? "-" : "+"}
                KES {Math.abs(difference).toLocaleString()}
              </strong>
            </div>
          </div>

          <div className="quotation-message">
            <h4>Worker's Proposal</h4>

            <p>{message}</p>
          </div>
        </div>

        {/* ================= BUDGET INSIGHT ================= */}

        <div
          className={
            withinBudget ? "budget-card success" : "budget-card warning"
          }
        >
          {withinBudget ? (
            <>
              <CheckCircle2 size={22} />

              <div>
                <h4>Within Budget</h4>

                <p>
                  This quotation is within your planned budget by
                  <strong> KES {difference.toLocaleString()}</strong>.
                </p>
              </div>
            </>
          ) : (
            <>
              <XCircle size={22} />

              <div>
                <h4>Above Budget</h4>

                <p>
                  This quotation exceeds your budget by
                  <strong> KES {Math.abs(difference).toLocaleString()}</strong>.
                </p>
              </div>
            </>
          )}
        </div>

        {/* ================= ACTIONS ================= */}

        {status === "pending" && (
          <div className="quotation-actions">
            <button
              className="reject-btn"
              onClick={rejectQuotation}
              disabled={loading}
            >
              <XCircle size={18} />
              Reject
            </button>

            <button
              className="accept-btn"
              onClick={acceptQuotation}
              disabled={loading}
            >
              <CheckCircle2 size={18} />

              {loading ? "Processing..." : "Accept Quotation"}
            </button>
          </div>
        )}

        {status === "accepted" && (
          <div className="quotation-finished accepted-box">
            <CheckCircle2 size={24} />

            <div>
              <h4>Quotation Accepted</h4>

              <p>
                This quotation has already been accepted. The project can now
                proceed.
              </p>
            </div>
          </div>
        )}

        {status === "rejected" && (
          <div className="quotation-finished rejected-box">
            <XCircle size={24} />

            <div>
              <h4>Quotation Rejected</h4>

              <p>You have already rejected this quotation.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

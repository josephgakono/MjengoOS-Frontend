import { useEffect, useMemo, useState } from "react";
import { Eye, MapPin, Clock3, Wallet, BadgeCheck } from "lucide-react";

import QuotationModal from "./QuotationModal";
import { buildQuotationData } from "../../../utils/quotationHelpers";

export default function QuotationReview({ quotations, jobs, refreshData }) {
  const [quotationData, setQuotationData] = useState([]);
  const [selectedQuotation, setSelectedQuotation] = useState(null);

  const [loading, setLoading] = useState(true);

  //-------------------------------------------------
  // Build quotation objects
  //-------------------------------------------------

  useEffect(() => {
    async function load() {
      setLoading(true);

      const data = await buildQuotationData(quotations, jobs);

      setQuotationData(data);
      setLoading(false);
    }

    load();
  }, [quotations, jobs]);

  //-------------------------------------------------
  // Pending quotations only
  //-------------------------------------------------

  const pendingQuotations = useMemo(() => {
    return quotationData.filter((quote) => quote.status === "pending");
  }, [quotationData]);

  //-------------------------------------------------
  // Loading
  //-------------------------------------------------

  if (loading) {
    return (
      <div className="quotation-review-card">
        <div className="quotation-review-header">
          <h2>Review Quotations</h2>
        </div>

        <div className="quotation-loading">Loading quotations...</div>
      </div>
    );
  }

  //-------------------------------------------------
  // Empty State
  //-------------------------------------------------

  if (pendingQuotations.length === 0) {
    return (
      <div className="quotation-review-card">
        <div className="quotation-review-header">
          <div>
            <h2>Review Quotations</h2>

            <p>Review incoming quotations from skilled workers.</p>
          </div>
        </div>

        <div className="quotation-empty">
          <img
            src="https://cdn-icons-png.flaticon.com/512/7486/7486740.png"
            alt=""
          />

          <h3>No quotations yet</h3>

          <p>Workers haven't submitted any quotations for your jobs yet.</p>
        </div>
      </div>
    );
  }

  //-------------------------------------------------
  // UI
  //-------------------------------------------------

  return (
    <>
      <div className="quotation-review-card">
        <div className="quotation-review-header">
          <div>
            <h2>Review Quotations</h2>

            <p>
              {pendingQuotations.length} quotation
              {pendingQuotations.length > 1 ? "s" : ""} awaiting your review.
            </p>
          </div>
        </div>

        <div className="quotation-review-grid">
          {pendingQuotations.map((quotation) => {
            const worker = quotation.worker;
            const job = quotation.job;

            const avatar =
              worker?.user?.profile_picture ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                worker?.user?.username || "Worker",
              )}&background=634ce7&color=fff`;

            return (
              <div className="quotation-card" key={quotation.id}>
                <div className="quotation-card-top">
                  <img
                    src={avatar}
                    alt={worker?.user?.username}
                    className="quotation-avatar"
                  />

                  <div>
                    <h3>{worker?.user?.username}</h3>

                    <p>{worker?.profession}</p>
                  </div>

                  {worker?.verified && (
                    <span className="verified-chip">
                      <BadgeCheck size={15} />
                    </span>
                  )}
                </div>

                <div className="quotation-job">
                  <strong>{job?.title}</strong>
                </div>

                <div className="quotation-meta">
                  <div>
                    <Wallet size={16} />

                    <span>KES {Number(quotation.amount).toLocaleString()}</span>
                  </div>

                  <div>
                    <Clock3 size={16} />

                    <span>{quotation.estimated_days} days</span>
                  </div>

                  <div>
                    <MapPin size={16} />

                    <span>{worker?.location}</span>
                  </div>
                </div>

                <button
                  className="review-btn"
                  onClick={() => setSelectedQuotation(quotation)}
                >
                  <Eye size={18} />
                  View Details
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <QuotationModal
        quotation={selectedQuotation}
        isOpen={selectedQuotation !== null}
        onClose={() => setSelectedQuotation(null)}
        onUpdated={refreshData}
      />
    </>
  );
}

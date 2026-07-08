import { useMemo, useState } from "react";
import { Eye, MapPin, CalendarDays, Wallet, Clock3, User } from "lucide-react";
import "../../../styles/quotationReview.css";

import QuotationModal from "./QuotationModal";

export default function QuotationReview({ jobs, quotations, refreshData }) {
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const jobsWithQuotations = useMemo(() => {
    return jobs.map((job) => {
      const jobId = job?.id;
      const jobObj = job ?? null;

      return {
        ...jobObj,
        quotations: (quotations || []).filter((quotation) => {
          // quotation.job might be an id, an expanded job object, or null
          const qJob = quotation?.job;
          if (qJob == null) return false;

          if (typeof qJob === "object") {
            // QuotationSerializer typically returns job as an id (not expanded),
            // but handle the case where it is expanded.
            return qJob?.id === jobId;
          }

          // qJob is likely an id
          return qJob === jobId;
        }),
      };
    });
  }, [jobs, quotations]);

  return (
    <>
      <section className="quotation-review-section">
        <div className="section-header">
          <div>
            <h2>Review Quotations</h2>
            <p>Compare contractors before accepting a quotation.</p>
          </div>
        </div>

        {jobsWithQuotations.length === 0 && (
          <div className="empty-state">
            <h3>No jobs found</h3>
            <p>Post a job to begin receiving quotations.</p>
          </div>
        )}

        {jobsWithQuotations.map((job) => (
          <div key={job.id} className="job-quotation-card">
            <div className="job-header">
              <div>
                <h3>{job.title}</h3>

                <div className="job-meta">
                  <span>
                    <MapPin size={15} />
                    {job.location}
                  </span>

                  <span>
                    <Wallet size={15} />
                    KES {Number(job.budget).toLocaleString()}
                  </span>

                  <span>
                    <CalendarDays size={15} />
                    {new Date(job.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="quotation-count">
                {job.quotations.length} Quotation
                {job.quotations.length !== 1 && "s"}
              </div>
            </div>

            {job.quotations.length === 0 ? (
              <div className="empty-job">No quotations received yet.</div>
            ) : (
              <div className="quotation-grid">
                {job.quotations.map((quotation) => (
                  <div key={quotation.id} className="quotation-card">
                    <div className="quotation-worker">
                      <img
                        src={
                          quotation.worker?.user?.profile_picture ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            quotation.worker?.user?.username || "Worker",
                          )}`
                        }
                        alt=""
                      />

                      <div>
                        <h4>
                          {quotation.worker?.user?.username ||
                            quotation.worker?.username ||
                            "Worker"}
                        </h4>

                        <span>
                          {quotation.worker?.profession ||
                            quotation.worker?.user?.profession ||
                            ""}
                        </span>
                      </div>
                    </div>

                    <div className="quotation-details">
                      <div>
                        <Wallet size={16} />
                        <span>
                          KES {Number(quotation.amount).toLocaleString()}
                        </span>
                      </div>

                      <div>
                        <Clock3 size={16} />
                        <span>{quotation.estimated_days} Days</span>
                      </div>

                      <div>
                        <User size={16} />
                        <span>
                          {quotation.worker?.experience_years} Years Experience
                        </span>
                      </div>
                    </div>

                    <div className={`quotation-status ${quotation.status}`}>
                      {quotation.status}
                    </div>

                    <button
                      className="view-quotation-btn"
                      onClick={() => {
                        setSelectedQuotation(quotation);
                        setOpenModal(true);
                      }}
                    >
                      <Eye size={18} />
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>

      <QuotationModal
        quotation={selectedQuotation}
        isOpen={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedQuotation(null);
        }}
        onUpdated={refreshData}
      />
    </>
  );
}

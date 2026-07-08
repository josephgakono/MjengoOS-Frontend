import { useMemo } from "react";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock3,
} from "lucide-react";

import "../../../styles/quotationSummary.css";

export default function QuotationSummary({
  jobs,
  quotations,
}) {
  //------------------------------------------------------
  // Summary Statistics
  //------------------------------------------------------

  const summary = useMemo(() => {
    const accepted = quotations.filter(
      (q) => q.status === "accepted"
    ).length;

    const rejected = quotations.filter(
      (q) => q.status === "rejected"
    ).length;

    const pending = quotations.filter(
      (q) => q.status === "pending"
    ).length;

    return {
      total: quotations.length,
      accepted,
      rejected,
      pending,
    };
  }, [quotations]);

  //------------------------------------------------------
  // Build table
  //------------------------------------------------------

  const rows = useMemo(() => {
    return jobs.map((job) => {
      const jobQuotes = quotations.filter(
        (q) => q.job === job.id
      );

      const accepted = jobQuotes.find(
        (q) => q.status === "accepted"
      );

      const cheapest =
        jobQuotes.length > 0
          ? Math.min(
              ...jobQuotes.map((q) => Number(q.amount))
            )
          : null;

      return {
        ...job,
        quotationCount: jobQuotes.length,
        accepted,
        cheapest,
      };
    });
  }, [jobs, quotations]);

  //------------------------------------------------------

  return (
    <section className="quotation-summary">

      <div className="summary-header">
        <h2>Quotation Summary</h2>
        <p>
          Overview of all quotations submitted for
          your jobs.
        </p>
      </div>

      {/* ================= Cards ================= */}

      <div className="summary-cards">

        <div className="summary-card">
          <FileText size={24} />
          <div>
            <span>Total Quotations</span>
            <h3>{summary.total}</h3>
          </div>
        </div>

        <div className="summary-card accepted">
          <CheckCircle2 size={24} />
          <div>
            <span>Accepted</span>
            <h3>{summary.accepted}</h3>
          </div>
        </div>

        <div className="summary-card pending">
          <Clock3 size={24} />
          <div>
            <span>Pending</span>
            <h3>{summary.pending}</h3>
          </div>
        </div>

        <div className="summary-card rejected">
          <XCircle size={24} />
          <div>
            <span>Rejected</span>
            <h3>{summary.rejected}</h3>
          </div>
        </div>

      </div>

      {/* ================= Table ================= */}

      <div className="summary-table-wrapper">

        <table className="summary-table">

          <thead>
            <tr>
              <th>Job</th>
              <th>Budget</th>
              <th>Quotations</th>
              <th>Lowest Quote</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="empty-summary"
                >
                  No jobs found.
                </td>
              </tr>
            ) : (
              rows.map((job) => (
                <tr key={job.id}>

                  <td>
                    <strong>{job.title}</strong>
                    <br />
                    <small>{job.location}</small>
                  </td>

                  <td>
                    KES{" "}
                    {Number(job.budget).toLocaleString()}
                  </td>

                  <td>{job.quotationCount}</td>

                  <td>
                    {job.cheapest !== null
                      ? `KES ${job.cheapest.toLocaleString()}`
                      : "-"}
                  </td>

                  <td>
                    {job.accepted ? (
                      <span className="status accepted">
                        Accepted
                      </span>
                    ) : job.quotationCount > 0 ? (
                      <span className="status pending">
                        Pending
                      </span>
                    ) : (
                      <span className="status empty">
                        No Quotes
                      </span>
                    )}
                  </td>

                </tr>
              ))
            )}

          </tbody>

        </table>

      </div>

    </section>
  );
}
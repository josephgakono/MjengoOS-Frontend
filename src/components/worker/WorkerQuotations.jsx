import { useEffect, useMemo, useState } from "react";
import { Search, CheckCircle2, XCircle, X } from "lucide-react";

import { api } from "../../services/api";

import "../../styles/Quotation.css";

export default function WorkerQuotations() {
  const [loading, setLoading] = useState(true);

  const [quotations, setQuotations] = useState([]);

  const [search, setSearch] = useState("");

  const [selected, setSelected] = useState(null);

  //--------------------------------------------------
  // Load Data
  //--------------------------------------------------

  useEffect(() => {
    loadQuotations();
  }, []);

  async function loadQuotations() {
    try {
      setLoading(true);

      //-------------------------------------
      // Logged in worker profile
      //-------------------------------------

      const workerResponse = await api.get("workerprofile/");

      const worker = Array.isArray(workerResponse)
        ? workerResponse[0]
        : workerResponse;

      //-------------------------------------
      // Quotations
      //-------------------------------------

      const quotationResponse = await api.get("quotations/");

      const allQuotations = Array.isArray(quotationResponse)
        ? quotationResponse
        : quotationResponse.results || [];

      //-------------------------------------
      // Mine only
      //-------------------------------------

      const mine = allQuotations.filter(
        (q) => Number(q.worker) === Number(worker.id),
      );

      //-------------------------------------
      // Attach Job + Customer
      //-------------------------------------

      const data = await Promise.all(
        mine.map(async (quotation) => {
          try {
            const job = await api.get(`jobs/${quotation.job}/`);

            const customer = await api.get(`users/${job.customer}/`);

            return {
              ...quotation,
              job,
              customer,
            };
          } catch {
            return {
              ...quotation,
              job: null,
              customer: null,
            };
          }
        }),
      );

      data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setQuotations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  //--------------------------------------------------
  // Statistics
  //--------------------------------------------------

  const accepted = quotations.filter((q) => q.status === "accepted");

  const rejected = quotations.filter((q) => q.status === "rejected");

  //--------------------------------------------------
  // Search
  //--------------------------------------------------

  const filterTable = (list) => {
    if (!search.trim()) return list;

    const value = search.toLowerCase();

    return list.filter((q) => {
      return (
        q.job?.title?.toLowerCase().includes(value) ||
        q.customer?.username?.toLowerCase().includes(value)
      );
    });
  };

  const acceptedList = useMemo(() => filterTable(accepted), [accepted, search]);

  const rejectedList = useMemo(() => filterTable(rejected), [rejected, search]);

  //--------------------------------------------------
  // Helpers
  //--------------------------------------------------

  function money(value) {
    return Number(value).toLocaleString();
  }

  function date(value) {
    return new Date(value).toLocaleDateString();
  }

  //--------------------------------------------------

  if (loading) {
    return <div className="quotation-loading">Loading quotations...</div>;
  }

  return (
    <>
      <div className="quotation-page">
        {/* Top */}

        <div className="quotation-top">
          <div className="quote-stat accepted">
            <CheckCircle2 size={18} />

            <div>
              <small>Accepted</small>

              <strong>{accepted.length}</strong>
            </div>
          </div>

          <div className="quote-stat rejected">
            <XCircle size={18} />

            <div>
              <small>Rejected</small>

              <strong>{rejected.length}</strong>
            </div>
          </div>
        </div>

        {/* Search */}

        <div className="quotation-search">
          <Search size={18} />

          <input
            placeholder="Search quotations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Tables */}

        <div className="quotation-grid">
          {/* Accepted */}

          <div className="quotation-table">
            <h3>Accepted Quotations</h3>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Job</th>

                    <th>Budget</th>

                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {acceptedList.map((q) => (
                    <tr key={q.id} onClick={() => setSelected(q)}>
                      <td>{q.job?.title}</td>

                      <td>KES {money(q.job?.budget)}</td>

                      <td>{date(q.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Rejected */}

          <div className="quotation-table">
            <h3>Rejected Quotations</h3>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Job</th>

                    <th>Budget</th>

                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {rejectedList.map((q) => (
                    <tr key={q.id} onClick={() => setSelected(q)}>
                      <td>{q.job?.title}</td>

                      <td>KES {money(q.job?.budget)}</td>

                      <td>{date(q.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ==========================
          MODAL
      =========================== */}

      {selected && (
        <div className="quotation-overlay" onClick={() => setSelected(null)}>
          <div className="quotation-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header */}

            <div className="quotation-modal-header">
              <h2>Quotation Details</h2>

              <button onClick={() => setSelected(null)}>
                <X size={20} />
              </button>
            </div>

            {/* Job */}

            <div className="quotation-section">
              <h3>Job Information</h3>

              <p>
                <strong>Title:</strong> {selected.job?.title}
              </p>

              <p>
                <strong>Location:</strong> {selected.job?.location}
              </p>

              <p>
                <strong>Budget:</strong> KES {money(selected.job?.budget)}
              </p>

              <p>
                <strong>Description:</strong>
              </p>

              <p className="description">{selected.job?.description}</p>
            </div>

            {/* Customer */}

            <div className="quotation-section">
              <h3>Customer</h3>

              <p>
                <strong>Name:</strong> {selected.customer?.first_name}{" "}
                {selected.customer?.last_name}
              </p>

              <p>
                <strong>Username:</strong> @{selected.customer?.username}
              </p>
            </div>

            {/* Quotation */}

            <div className="quotation-section">
              <h3>Your Quotation</h3>

              <p>
                <strong>Amount:</strong> KES {money(selected.amount)}
              </p>

              <p>
                <strong>Estimated Days:</strong> {selected.estimated_days}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                <span className={`badge ${selected.status}`}>
                  {selected.status}
                </span>
              </p>

              <p>
                <strong>Submitted:</strong> {date(selected.created_at)}
              </p>

              <div className="quotation-message">
                <strong>Message</strong>

                <p>{selected.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

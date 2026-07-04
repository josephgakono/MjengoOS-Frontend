import { useEffect, useMemo, useState } from "react";
import {
  Search,
  CheckCircle2,
  XCircle,
  X,
  ClipboardList,
  Wallet,
  MapPin,
  Calendar,
} from "lucide-react";


import { api } from "../../services/api";

import "../../styles/Quotation.css";
import "../../styles/Jobs.css";

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
  // Search (merged list)
  //--------------------------------------------------

  const filteredQuotations = useMemo(() => {
    if (!search.trim()) return quotations;

    const value = search.toLowerCase();

    return quotations.filter((q) => {
      const title = q.job?.title?.toLowerCase() || "";
      const username = q.customer?.username?.toLowerCase() || "";
      return title.includes(value) || username.includes(value);
    });
  }, [quotations, search]);

  const acceptedList = useMemo(
    () => filteredQuotations.filter((q) => q.status === "accepted"),
    [filteredQuotations],
  );

  const rejectedList = useMemo(
    () => filteredQuotations.filter((q) => q.status === "rejected"),
    [filteredQuotations],
  );


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



        {/* Search */}

        <div className="quotation-search" style={{ marginBottom: 18 }}>
          <Search size={18} />

          <input
            placeholder="Search quotations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>


        {/* Tables (merged dataset, split into 2 columns by status) */}

        <div className="jobs-container">
            <div className="jobs-header">
            <div>
              <h2>My Quotations</h2>
              <p>Review accepted and rejected quotation requests.</p>
            </div>
          </div>


          <div className="jobs-columns">
            <div className="jobs-column">
              <div className="column-header">
                <h3>Accepted Quotations</h3>
                <span>{acceptedList.length}</span>
              </div>

              <div className="jobs-scroll">
                {acceptedList.length > 0 ? (
                  acceptedList.map((q) => (
                    <button key={q.id} className="job-item" onClick={() => setSelected(q)}>
                      <div className="job-item-top">
                        <div>
                          <h4>{q.job?.title || "Untitled Job"}</h4>
                          <div className="job-meta">
                            <span>
                              <ClipboardList size={14} />
                              {q.job?.location || "Location not provided"}
                            </span>
                            <span>
                              <Wallet size={14} />
                              KES {money(q.job?.budget)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="job-item-bottom">
                        <span className="status accepted">Accepted</span>
                        <span className="view-text">{date(q.created_at)}</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="empty-state">
                    <CheckCircle2 size={44} />
                    <p>No accepted quotations found.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="jobs-column">
              <div className="column-header">
                <h3>Rejected Quotations</h3>
                <span>{rejectedList.length}</span>
              </div>

              <div className="jobs-scroll">
                {rejectedList.length > 0 ? (
                  rejectedList.map((q) => (
                    <button key={q.id} className="job-item" onClick={() => setSelected(q)}>
                      <div className="job-item-top">
                        <div>
                          <h4>{q.job?.title || "Untitled Job"}</h4>
                          <div className="job-meta">
                            <span>
                              <ClipboardList size={14} />
                              {q.job?.location || "Location not provided"}
                            </span>
                            <span>
                              <Wallet size={14} />
                              KES {money(q.job?.budget)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="job-item-bottom">
                        <span className="status rejected">Rejected</span>
                        <span className="view-text">{date(q.created_at)}</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="empty-state">
                    <XCircle size={44} />
                    <p>No rejected quotations found.</p>
                  </div>
                )}
              </div>
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

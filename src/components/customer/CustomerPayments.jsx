import { useEffect, useMemo, useState } from "react";
import { CreditCard, Wallet, Lock, CheckCircle, Eye, X } from "lucide-react";
import { api } from "../../services/api";
import "../../styles/customerPayments.css";

export default function CustomerPayments() {
  const [loading, setLoading] = useState(true);

  const [payments, setPayments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [workers, setWorkers] = useState([]);

  const [filter, setFilter] = useState("all");

  const [selectedPayment, setSelectedPayment] = useState(null);

  //--------------------------------------------------
  // Load Data
  //--------------------------------------------------

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [paymentData, projectData, jobData] = await Promise.all([
        api.get("payments/"),
        api.get("projects/"),
        api.get("jobs/"),
      ]);

      const workerProfiles = await Promise.all(
        projectData.map((project) =>
          api.get(`workerprofile/${project.worker}/`),
        ),
      );

      const workers = await Promise.all(
        workerProfiles.map(async (worker) => {
          const user = await api.get(`users/${worker.user}/`);

          return {
            ...worker,
            full_name: `${user.first_name} ${user.last_name}`,
          };
        }),
      );

      setPayments(paymentData);
      setProjects(projectData);
      setJobs(jobData);
      setWorkers(workers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  //--------------------------------------------------
  // Lookup Maps
  //--------------------------------------------------

  const jobsMap = useMemo(() => {
    const map = {};

    jobs.forEach((job) => {
      map[job.id] = job;
    });

    return map;
  }, [jobs]);

  const projectsMap = useMemo(() => {
    const map = {};

    projects.forEach((project) => {
      map[project.id] = project;
    });

    return map;
  }, [projects]);

  const workersMap = useMemo(() => {
    const map = {};

    workers.forEach((worker) => {
      map[worker.id] = worker;
    });

    return map;
  }, [workers]);

  //--------------------------------------------------
  // Filter Payments
  //--------------------------------------------------

  const filteredPayments = useMemo(() => {
    if (filter === "all") return payments;

    if (filter === "released") {
      return payments.filter((payment) => payment.escrow_status === "released");
    }

    if (filter === "pending") {
      return payments.filter((payment) => payment.escrow_status !== "released");
    }

    return payments.filter((payment) => payment.payment_type === filter);
  }, [payments, filter]);

  //--------------------------------------------------
  // Summary Cards
  //--------------------------------------------------

  const summary = useMemo(() => {
    let total = 0;
    let escrow = 0;
    let released = 0;

    payments.forEach((payment) => {
      const amount = Number(payment.amount);

      total += amount;

      if (payment.escrow_status === "released") {
        released += amount;
      } else {
        escrow += amount;
      }
    });

    return {
      total,
      escrow,
      released,
      transactions: payments.length,
    };
  }, [payments]);

  //--------------------------------------------------
  // Helpers
  //--------------------------------------------------

  function formatMoney(amount) {
    return `KES ${Number(amount).toLocaleString()}`;
  }

  function formatDate(date) {
    if (!date) return "-";

    return new Date(date).toLocaleDateString();
  }

  function badge(status) {
    switch (status?.toLowerCase()) {
      case "successful":
        return "badge success";

      case "released":
        return "badge released";

      case "pending":
        return "badge pending";

      case "failed":
        return "badge failed";

      default:
        return "badge";
    }
  }

  //--------------------------------------------------
  // Loading
  //--------------------------------------------------

  if (loading) {
    return <div className="customer-payments-page">Loading payments...</div>;
  }
  return (
    <div className="customer-payments-page">
      {/* Summary */}

      <div className="payments-summary">
        <div className="summary-card">
          <Wallet size={26} />
          <div>
            <span>Total Paid</span>
            <h3>{formatMoney(summary.total)}</h3>
          </div>
        </div>

        <div className="summary-card">
          <Lock size={26} />
          <div>
            <span>In Escrow</span>
            <h3>{formatMoney(summary.escrow)}</h3>
          </div>
        </div>

        <div className="summary-card">
          <CheckCircle size={26} />
          <div>
            <span>Released</span>
            <h3>{formatMoney(summary.released)}</h3>
          </div>
        </div>

        <div className="summary-card">
          <CreditCard size={26} />
          <div>
            <span>Transactions</span>
            <h3>{summary.transactions}</h3>
          </div>
        </div>
      </div>

      {/* Filter */}

      <div className="payments-toolbar">
        <h2>Payment History</h2>

        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="deposit">Deposits</option>
          <option value="released">Released</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Table */}

      <div className="payments-table">
        <div className="payments-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Project</th>
                <th>Worker</th>
                <th>Amount</th>
                <th>Escrow</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-payments">
                    <CreditCard size={40} />
                    <p>No payments found.</p>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => {
                  const project = projectsMap[payment.project];
                  const job = jobsMap[project?.job];
                  const worker = workersMap[project?.worker];

                  return (
                    <tr key={payment.id}>
                      <td>{job?.title || "Unknown Project"}</td>

                      <td>{worker?.full_name || "Unknown Worker"}</td>

                      <td>{formatMoney(payment.amount)}</td>

                      

                      <td>
                        <span className={badge(payment.escrow_status)}>
                          {payment.escrow_status}
                        </span>
                      </td>

                      <td>
                        <span className={badge(payment.status)}>
                          {payment.status}
                        </span>
                      </td>

                      <td>
                        <button
                          className="view-payment-btn"
                          onClick={() => setSelectedPayment(payment)}
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}

      {selectedPayment &&
        (() => {
          const project = projectsMap[selectedPayment.project];
          const job = jobsMap[project?.job];
          const worker = workersMap[project?.worker];

          return (
            <div
              className="payment-modal-overlay"
              onClick={() => setSelectedPayment(null)}
            >
              <div
                className="payment-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="close-modal"
                  onClick={() => setSelectedPayment(null)}
                >
                  <X size={20} />
                </button>

                <h2>Payment #{selectedPayment.id}</h2>

                <div className="payment-details">
                  <div>
                    <strong>Project</strong>
                    <span>{job?.title || "-"}</span>
                  </div>

                  <div>
                    <strong>Worker</strong>
                    <span>{worker?.full_name || "-"}</span>
                  </div>

                  <div>
                    <strong>Profession</strong>
                    <span>{worker?.profession || "-"}</span>
                  </div>

                  <div>
                    <strong>Project Status</strong>
                    <span>{project?.status || "-"}</span>
                  </div>

                  <div>
                    <strong>Amount</strong>
                    <span>{formatMoney(selectedPayment.amount)}</span>
                  </div>

                  <div>
                    <strong>Payment Type</strong>
                    <span>{selectedPayment.payment_type}</span>
                  </div>

                  <div>
                    <strong>Status</strong>
                    <span>{selectedPayment.status}</span>
                  </div>

                  <div>
                    <strong>Escrow</strong>
                    <span>{selectedPayment.escrow_status}</span>
                  </div>

                  <div>
                    <strong>M-Pesa Receipt</strong>
                    <span>{selectedPayment.mpesa_receipt_number || "-"}</span>
                  </div>

                  <div>
                    <strong>Phone Number</strong>
                    <span>{selectedPayment.phone_number}</span>
                  </div>

                  <div>
                    <strong>Created</strong>
                    <span>{formatDate(selectedPayment.created_at)}</span>
                  </div>

                  <div>
                    <strong>Released</strong>
                    <span>{formatDate(selectedPayment.released_at)}</span>
                  </div>

                  <div className="full-width">
                    <strong>Checkout Request ID</strong>
                    <span>{selectedPayment.checkout_request_id}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}

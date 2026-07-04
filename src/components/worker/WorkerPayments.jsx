import { useEffect, useMemo, useState } from "react";
import {
  Wallet,
  Search,
  CheckCircle2,
  Lock,
  CreditCard,
  ClipboardList,
  XCircle,
  X,
} from "lucide-react";

import "../../styles/Jobs.css";


import { api } from "../../services/api";

import "../../styles/WorkerPayments.css";

export default function WorkerPayments() {
  const [loading, setLoading] = useState(true);

  const [payments, setPayments] = useState([]);

  const [search, setSearch] = useState("");

  // Used as modal state too
  const [selectedPayment, setSelectedPayment] = useState(null);

  //-----------------------------------------
  // Load Everything
  //-----------------------------------------

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      // Current worker

      const workerResponse = await api.get("workerprofile/");

      const worker = Array.isArray(workerResponse)
        ? workerResponse[0]
        : workerResponse;

      // Load everything together

      const [
        paymentResponse,
        projectResponse,
        jobResponse,
        customerProfileResponse,
        userResponse,
      ] = await Promise.all([
        api.get("payments/"),
        api.get("projects/"),
        api.get("jobs/"),
        api.get("customerprofile/"),
        api.get("users/"),
      ]);

      const allPayments = Array.isArray(paymentResponse)
        ? paymentResponse
        : paymentResponse.results || [];

      const allProjects = Array.isArray(projectResponse)
        ? projectResponse
        : projectResponse.results || [];

      const allJobs = Array.isArray(jobResponse)
        ? jobResponse
        : jobResponse.results || [];

      const customers = Array.isArray(customerProfileResponse)
        ? customerProfileResponse
        : customerProfileResponse.results || [];

      const users = Array.isArray(userResponse)
        ? userResponse
        : userResponse.results || [];

      //-----------------------------------------
      // Only projects belonging to me
      //-----------------------------------------

      const myProjects = allProjects.filter(
        (project) => Number(project.worker) === Number(worker.id),
      );

      //-----------------------------------------
      // Join all related information
      //-----------------------------------------

      const data = allPayments
        .filter((payment) =>
          myProjects.some((project) => project.id === payment.project),
        )
        .map((payment) => {
          const project = myProjects.find((p) => p.id === payment.project);

          const job = allJobs.find((j) => j.id === project?.job);

          const customerProfile = customers.find((c) => c.id === job?.customer);

          const customer = users.find((u) => u.id === customerProfile?.user);

          return {
            ...payment,
            project,
            job,
            customer,
          };
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setPayments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  //-----------------------------------------
  // Statistics
  //-----------------------------------------

  const stats = useMemo(() => {
    return {
      earned: payments
        .filter((p) => p.escrow_status === "released")
        .reduce((sum, p) => sum + Number(p.amount), 0),

      escrow: payments
        .filter((p) => p.escrow_status !== "released")
        .reduce((sum, p) => sum + Number(p.amount), 0),

      released: payments.filter((p) => p.escrow_status === "released").length,

      transactions: payments.length,
    };
  }, [payments]);

  //-----------------------------------------
  // Search
  //-----------------------------------------

  const filtered = useMemo(() => {
    if (!search.trim()) return payments;

    const value = search.toLowerCase();

    return payments.filter((payment) => {
      return (
        payment.mpesa_receipt_number?.toLowerCase().includes(value) ||
        payment.customer?.username?.toLowerCase().includes(value) ||
        payment.customer?.first_name?.toLowerCase().includes(value) ||
        payment.job?.title?.toLowerCase().includes(value)
      );
    });
  }, [payments, search]);

  const releasedPayments = filtered.filter(
    (payment) => payment.escrow_status === "released",
  );

  const escrowPayments = filtered.filter(
    (payment) => payment.escrow_status !== "released",
  );

  //-----------------------------------------
  // Helpers
  //-----------------------------------------

  function initials(user) {
    if (!user) return "U";

    return (
      (user.first_name?.[0] || "") + (user.last_name?.[0] || "")
    ).toUpperCase();
  }

  function renderPaymentCards(list, variant) {
    // variant: "released" | "escrow"

    const isReleased = variant === "released";


    return (
      <div className="jobs-column">
        <div className="column-header">
          <h3>{isReleased ? "Released Payments" : "Escrow Payments"}</h3>
          <span>{list.length}</span>
        </div>

        <div className="jobs-scroll">
          {list.length > 0 ? (
            list.map((payment) => (
              <button
                key={payment.id}
                className="job-item"
                onClick={() => setSelectedPayment(payment)}
              >
                <div className="job-item-top">
                  <div>
                    <h4>{payment.job?.title || "Untitled Project"}</h4>
                    <div className="job-meta">
                      <span>
                        <ClipboardList size={14} />
                        {payment.job?.location || "Location not provided"}
                      </span>
                      <span>
                        <Wallet size={14} />
                        KES {Number(payment.amount).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="job-item-bottom">
                  <span
                    className={`status ${
                      isReleased ? "accepted" : "rejected"
                    }`}
                  >
                    {payment.escrow_status}
                  </span>
                  <span className="view-text">
                    {new Date(payment.created_at).toLocaleDateString()}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <div className="empty-state">
              {isReleased ? <CheckCircle2 size={44} /> : <XCircle size={44} />}
              <p>
                {isReleased
                  ? "No released payments found."
                  : "No escrow payments found."}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }


  //-----------------------------------------

  if (loading) {
    return <div className="worker-payments-loading">Loading payments...</div>;
  }

  //-----------------------------------------

  return (
    <>
      <div className="worker-payments">
        {/* Summary */}

        <div className="payment-summary">
          <div className="payment-summary-card">
            <Wallet size={20} />
            <h4>Total Earned</h4>
            <strong>KES {stats.earned.toLocaleString()}</strong>
          </div>

          <div className="payment-summary-card">
            <Lock size={20} />
            <h4>In Escrow</h4>
            <strong>KES {stats.escrow.toLocaleString()}</strong>
          </div>

          <div className="payment-summary-card">
            <CheckCircle2 size={20} />
            <h4>Released</h4>
            <strong>{stats.released}</strong>
          </div>

          <div className="payment-summary-card">
            <CreditCard size={20} />
            <h4>Transactions</h4>
            <strong>{stats.transactions}</strong>
          </div>
        </div>

        {/* Search */}

        <div className="payment-search">
          <Search size={18} />

          <input
            placeholder="Search receipt, customer or project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Tables (cards) */}

        <div className="payment-grid">
          {renderPaymentCards(releasedPayments, "released")}
          {renderPaymentCards(escrowPayments, "escrow")}
        </div>
      </div>


      {/* Modal */}

      {selectedPayment && (
        <div
          className="payment-modal-overlay"
          onClick={() => setSelectedPayment(null)}
        >
          <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="payment-modal-header">
              <h2>Payment Details</h2>

              <button onClick={() => setSelectedPayment(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="payment-modal-body">
              <div className="payment-user">
                {selectedPayment.customer?.profile_picture ? (
                  <img src={selectedPayment.customer.profile_picture} alt="" />
                ) : (
                  <div className="payment-avatar">
                    {initials(selectedPayment.customer)}
                  </div>
                )}

                <div>
                  <strong>
                    {selectedPayment.customer?.first_name}{" "}
                    {selectedPayment.customer?.last_name}
                  </strong>

                  <span>@{selectedPayment.customer?.username}</span>
                </div>
              </div>

              <div className="payment-details">
                <div>
                  <label>Project</label>
                  <strong>{selectedPayment.job?.title}</strong>
                </div>

                <div>
                  <label>Location</label>
                  <strong>{selectedPayment.job?.location}</strong>
                </div>

                <div>
                  <label>Amount</label>
                  <strong>
                    KES {Number(selectedPayment.amount).toLocaleString()}
                  </strong>
                </div>

                <div>
                  <label>Receipt</label>
                  <strong>{selectedPayment.mpesa_receipt_number}</strong>
                </div>

                <div>
                  <label>Payment Type</label>
                  <strong>{selectedPayment.payment_type}</strong>
                </div>

                <div>
                  <label>Escrow</label>
                  <strong>{selectedPayment.escrow_status}</strong>
                </div>

                <div>
                  <label>Status</label>
                  <strong>{selectedPayment.status}</strong>
                </div>

                <div>
                  <label>Phone</label>
                  <strong>{selectedPayment.phone_number}</strong>
                </div>

                <div>
                  <label>Transaction Date</label>
                  <strong>
                    {new Date(
                      selectedPayment.transaction_date,
                    ).toLocaleString()}
                  </strong>
                </div>

                <div>
                  <label>Project Status</label>
                  <strong>{selectedPayment.project?.status}</strong>
                </div>
              </div>

              <div className="payment-description">
                <h4>Job Description</h4>
                <p>{selectedPayment.job?.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

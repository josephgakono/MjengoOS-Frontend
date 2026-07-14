import { useEffect, useState } from "react";
import { X, Wallet, CalendarDays, FileText } from "lucide-react";
import { api } from "../../services/api";
import "../../styles/quotemodal.css";

export default function QuoteModal({
  open,
  onClose,
  job,
  workerId,
  onSuccess,
}) {
  const [quote, setQuote] = useState({
    amount: "",
    estimated_days: "",
    message: "",
  });

  const [errors, setErrors] = useState({});

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setQuote({
        amount: "",
        estimated_days: "",
        message: "",
      });

      setErrors({});
    }
  }, [open]);

  if (!open || !job) return null;

  function handleChange(e) {
    const { name, value } = e.target;

    setQuote((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  }

  function validate() {
    const newErrors = {};

    if (!quote.amount) {
      newErrors.amount = "Quotation amount is required.";
    } else if (Number(quote.amount) <= 0) {
      newErrors.amount = "Amount must be greater than zero.";
    }

    if (!quote.estimated_days) {
      newErrors.estimated_days = "Estimated days is required.";
    } else if (Number(quote.estimated_days) <= 0) {
      newErrors.estimated_days = "Estimated days must be greater than zero.";
    }

    if (!quote.message.trim()) {
      newErrors.message =
        "Please introduce yourself and explain your proposal.";
    } else if (quote.message.trim().length < 20) {
      newErrors.message = "Proposal should contain at least 20 characters.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validate()) return;

    try {
      setSubmitting(true);

      await api.post("quotations/", {
        amount: Number(quote.amount),
        estimated_days: Number(quote.estimated_days),
        message: quote.message.trim(),
        worker: workerId,
        job: job.id,
      });

      onSuccess?.();

      onClose();

      alert("Quotation submitted successfully.");
    } catch (err) {
      console.error(err);

      alert(err.data?.detail || err.message || "Unable to submit quotation.");
    } finally {
      setSubmitting(false);
    }
  }

  const difference =
    quote.amount && job.budget
      ? Number(job.budget) - Number(quote.amount)
      : null;

  return (
    <div className="quote-modal-overlay" onClick={onClose}>
      <div className="quote-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}

        <div className="quote-modal-header">
          <div>
            <h2>Submit Quotation</h2>
            <p>Send your proposal to the customer.</p>
          </div>

          <button className="quote-close-btn" onClick={onClose} type="button">
            <X size={22} />
          </button>
        </div>

        {/* Job Summary */}

        <div className="quote-job-summary">
          <h3>{job.title}</h3>

          <div className="quote-summary-item">
            <Wallet size={18} />

            <span>
              Customer Budget:
              <strong> KES {Number(job.budget).toLocaleString()}</strong>
            </span>
          </div>

          <div className="quote-summary-item">
            <CalendarDays size={18} />

            <span>{job.location}</span>
          </div>
        </div>

        {/* Budget Comparison */}

        {difference !== null && (
          <div
            className={
              difference >= 0
                ? "budget-indicator good"
                : "budget-indicator high"
            }
          >
            {difference >= 0
              ? `Your quotation is KES ${difference.toLocaleString()} below the customer's budget.`
              : `Your quotation is KES ${Math.abs(
                  difference,
                ).toLocaleString()} above the customer's budget.`}
          </div>
        )}

        {/* Form */}

        <form className="quote-form" onSubmit={handleSubmit}>
          <label>
            Your Quotation (KES)
            <input
              type="number"
              name="amount"
              value={quote.amount}
              onChange={handleChange}
              placeholder="Enter your quotation"
            />
            {errors.amount && (
              <span className="field-error">{errors.amount}</span>
            )}
          </label>

          <label>
            Estimated Completion (Days)
            <input
              type="number"
              name="estimated_days"
              value={quote.estimated_days}
              onChange={handleChange}
              placeholder="e.g. 30"
            />
            {errors.estimated_days && (
              <span className="field-error">{errors.estimated_days}</span>
            )}
          </label>

          <label>
            <span className="textarea-title">
              <FileText size={18} />
              Proposal
            </span>

            <textarea
              rows={6}
              name="message"
              value={quote.message}
              onChange={handleChange}
              placeholder="Describe your experience, how you'll execute the work, why you're the best fit for this project..."
            />

            {errors.message && (
              <span className="field-error">{errors.message}</span>
            )}
          </label>

          {/* Footer */}

          <div className="quote-modal-footer">
            <button
              type="button"
              className="quote-cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="quote-submit-btn"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Quotation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

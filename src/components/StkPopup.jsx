import { useState } from "react";
import { X, Smartphone } from "lucide-react";
import { api } from "../services/api";

export default function StkPopup({
  open,
  onClose,
  amount,
  projectId,
  onSuccess,
}) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  //----------------------------------------------------
  // Submit STK Push
  //----------------------------------------------------

  async function initiatePayment(e) {
    e.preventDefault();

    if (!phoneNumber.trim()) {
      alert("Enter phone number.");
      return;
    }

    try {
      setLoading(true);

      await api.post("payments/stk-push/", {
        phone_number: phoneNumber,
        amount: amount,
        project_id: projectId,
        payment_type: "deposit",
      });

      alert(
        "STK Push has been sent to your phone. Complete the payment on your device.",
      );

      onSuccess?.();

      onClose();
    } catch (err) {
      console.error(err);

      alert("Failed to initiate STK Push.");
    } finally {
      setLoading(false);
    }
  }

  //----------------------------------------------------
  // JSX
  //----------------------------------------------------

  return (
    <div className="stk-overlay" onClick={onClose}>
      <div
        className="stk-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="stk-close"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        <div className="stk-header">

          <div className="stk-icon">
            <Smartphone size={34} />
          </div>

          <h2>M-PESA Payment</h2>

          <p>
            Enter the phone number that will receive the
            STK Push request.
          </p>

        </div>

        <form onSubmit={initiatePayment}>

          <div className="stk-field">

            <label>Phone Number</label>

            <input
              type="text"
              placeholder="254712345678"
              value={phoneNumber}
              onChange={(e) =>
                setPhoneNumber(e.target.value)
              }
            />

          </div>

          <div className="stk-field">

            <label>Amount</label>

            <input
              type="text"
              value={`KES ${Number(amount).toLocaleString()}`}
              readOnly
            />

          </div>

          <button
            type="submit"
            className="stk-pay-btn"
            disabled={loading}
          >
            {loading
              ? "Sending STK Push..."
              : "Pay Deposit"}
          </button>

        </form>
      </div>
    </div>
  );
}
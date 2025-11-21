import React, { useState } from "react";
import { API_BASE_URL } from "../../config";

const WalletRecharge = ({ user }) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const handleRecharge = async () => {
    clearMessages();
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    if (!window.Razorpay) {
      setError("Razorpay SDK not loaded.");
      return;
    }

    try {
      setLoading(true);
      const token = await user.getIdToken(true);

      // 1. Create order from backend
      const res = await fetch(`${API_BASE_URL}/api/payments/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Firebase ID token as JWT
        },
        body: JSON.stringify({ amount: amt }), // rupees
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to create order.");
      }

      const order = await res.json();
      setLoading(false);

      // 2. Open Razorpay checkout
      const options = {
        key: order.key_id,
        amount: order.amount, // paise
        currency: order.currency,
        name: "SmartPrint Wallet Recharge",
        description: "Add money to your SmartPrint wallet",
        order_id: order.order_id,
        prefill: {
          email: user.email,
          name: user.displayName || "",
        },
        theme: {
          color: "#6366f1",
        },
        handler: async function (response) {
          try {
            const verifyRes = await fetch(
              `${API_BASE_URL}/payments/verify`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  amount: order.amount, // paise
                }),
              }
            );

            const verifyData = await verifyRes.json().catch(() => ({}));
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(
                verifyData.detail || verifyData.message || "Verification failed"
              );
            }

            setSuccess("Payment successful! Wallet will update shortly.");
            setAmount("");
          } catch (err) {
            console.error(err);
            setError(err.message || "Payment verification failed.");
          }
        },
        modal: {
          ondismiss: function () {
            // optional: handle modal close
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      setLoading(false);
      setError(err.message || "Something went wrong.");
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 text-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <i className="fas fa-wallet text-indigo-400" />
            Wallet Recharge
          </h3>
          <p className="text-xs text-slate-400">
            Add money to your SmartPrint wallet using Razorpay.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount in ₹"
          className="flex-1 rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs outline-none focus:border-indigo-500"
        />
        <button
          type="button"
          onClick={handleRecharge}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-xs font-medium disabled:opacity-60"
        >
          {loading ? "Processing..." : "Add Money"}
        </button>
      </div>

      {error && (
        <div className="text-xs text-red-300">
          <i className="fas fa-exclamation-triangle mr-1" />
          {error}
        </div>
      )}
      {success && (
        <div className="text-xs text-emerald-300">
          <i className="fas fa-check-circle mr-1" />
          {success}
        </div>
      )}
    </div>
  );
};

export default WalletRecharge;

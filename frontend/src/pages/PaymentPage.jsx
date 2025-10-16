import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_URL || "https://urbanease-backend.onrender.com";
const API_PAY = `${API_BASE}/api/payments`;

export default function PaymentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("accessToken");
  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    }),
    [token]
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // COD: mark order as COD and proceed
  const selectCOD = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_PAY}/select-cod`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ orderId }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.message || "Failed to select COD");

      try {
        localStorage.removeItem("cart");
      } catch {}
      navigate("/orders");
    } catch (e) {
      setError(e.message || "Unable to select COD");
    } finally {
      setLoading(false);
    }
  };

  // UPI: go to a simple “scan and confirm” page
  const goToUpi = () => {
    navigate(`/checkout/payment/upi/${orderId}`);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">Choose payment method</h1>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <button
          onClick={goToUpi}
          disabled={loading}
          className={`w-full px-5 py-3 rounded text-white ${loading ? "bg-gray-400" : "bg-black hover:bg-gray-900"}`}
        >
          UPI (Scan to Pay)
        </button>

        <button
          onClick={selectCOD}
          disabled={loading}
          className="w-full px-5 py-3 rounded border hover:bg-gray-50"
        >
          Cash on Delivery
        </button>
      </div>
    </div>
  );
}
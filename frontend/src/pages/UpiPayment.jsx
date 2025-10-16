import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_URL || "https://urbanease-backend.onrender.com";
const API_PAY = `${API_BASE}/api/payments`;
const REACT_UPI_VPA = process.env.REACT_APP_UPI_VPA || "urbanease@upi";
const REACT_UPI_NAME = process.env.REACT_APP_UPI_NAME || "UrbanEase";

// Lightweight QR image component (no dependencies)
function QRImage({ value, size = 220, alt = "QR code" }) {
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
    value || ""
  )}`;
  return <img src={src} width={size} height={size} alt={alt} />;
}

export default function UpiPayment() {
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

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [amount, setAmount] = useState(0);
  const [upiUri, setUpiUri] = useState("");
  const [vpa, setVpa] = useState(REACT_UPI_VPA);
  const [payeeName, setPayeeName] = useState(REACT_UPI_NAME);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await fetch(`${API_PAY}/initiate`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to prepare UPI");
      }
      const d = data.data || {};
      setUpiUri(d.upiUri);
      setVpa(d.vpa || vpa);
      setPayeeName(d.payeeName || payeeName);
      setAmount(Number(d.amount || 0));
    } catch (e) {
      setErr(e.message || "Could not prepare UPI");
    } finally {
      setLoading(false);
    }
  }, [orderId, headers, vpa, payeeName]);

  useEffect(() => {
    load();
  }, [load]);

  const confirmUpiPaid = async () => {
    try {
      setLoading(true);
      const reference = "UPI" + Math.random().toString(36).slice(2, 8).toUpperCase();
      const res = await fetch(`${API_PAY}/confirm`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ orderId, method: "upi", reference }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || "Failed to confirm payment");
      try {
        localStorage.removeItem("cart");
      } catch {}
      navigate("/orders");
    } catch (e) {
      setErr(e.message || "Failed to confirm payment");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-4">Scan to pay via UPI</h1>
      {loading ? (
        <div>Preparing UPI…</div>
      ) : (
        <>
          {err && <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">{err}</div>}
          <div className="bg-white rounded-lg border p-6 mb-6">
            <div className="flex flex-col items-center">
              <QRImage value={upiUri} size={220} alt="Scan with any UPI app" />
              <div className="mt-4 text-center">
                <div className="font-semibold">Scan with any UPI app</div>
                <div className="text-sm text-gray-600 mt-1">
                  Amount: ₹{amount.toFixed(2)} • Payee: {payeeName} • UPI: {vpa}
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={confirmUpiPaid}
                disabled={loading}
                className={`px-5 py-2 rounded text-white ${loading ? "bg-gray-400" : "bg-black hover:bg-gray-900"}`}
              >
                I’ve paid, place my order
              </button>
              <button
                onClick={() => navigate(-1)}
                className="px-5 py-2 rounded border hover:bg-gray-50"
              >
                Back
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
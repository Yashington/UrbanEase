import React, { useContext, useEffect, useState } from "react";
import OrderStatusTimeline from "../components/orders/OrderStatusTimeline";
import { SocketContext } from "../App";

export default function MyOrders() {
  const socket = useContext(SocketContext);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("http://localhost:5000/api/orders/my-orders", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data?.message || "Failed to load orders");
      }
      const list = data?.data?.orders || data?.orders || [];
      setOrders(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Realtime update when admin changes status
  useEffect(() => {
    if (!socket) return;
    const handler = (payload) => {
      // payload: { orderId, status }
      setOrders((prev) =>
        prev.map((o) => (o._id === payload.orderId ? { ...o, status: payload.status } : o))
      );
    };
    socket.on("order status update", handler);
    return () => socket.off("order status update", handler);
  }, [socket]);

  if (loading) return <div className="p-6">Loading your orders...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen pt-[90px]">
      <div className="max-w-5xl mx-auto space-y-6 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#1e3a8a]">My Orders</h1>
          <button
            onClick={fetchOrders}
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded"
          >
            Refresh
          </button>
        </div>

        {orders.map((o) => (
          <div key={o._id} className="bg-white border rounded-2xl shadow p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="text-sm text-gray-600">
                <div><span className="font-semibold">Order:</span> {o.orderNumber || o._id}</div>
                <div><span className="font-semibold">Total:</span> ₹{Number(o.total || 0).toFixed(2)}</div>
              </div>
              <div className="text-right text-sm text-gray-600">
                <div><span className="font-semibold">Status:</span> <span className="capitalize">{o.status || "pending"}</span></div>
                <div><span className="font-semibold">Updated:</span> {o.updatedAt ? new Date(o.updatedAt).toLocaleString() : "-"}</div>
              </div>
            </div>

            {/* Timeline */}
            <OrderStatusTimeline
              status={(o.status || "pending").toLowerCase()}
              arrivingText="Arriving soon"
            />

            {/* Items summary (optional line) */}
            <div className="mt-3 text-sm text-gray-700">
              {Array.isArray(o.products) && o.products.length > 0 ? (
                <div>
                  <span className="font-semibold">Items:</span>{" "}
                  {o.products.map((p) => p.title || p.productId).join(", ")}
                </div>
              ) : null}
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="p-6 bg-white border rounded-2xl shadow text-center text-gray-600">
            No orders yet.
          </div>
        )}
      </div>
    </div>
  );
}
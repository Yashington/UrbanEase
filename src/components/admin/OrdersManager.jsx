import React, { useEffect, useState } from "react";
import { apiFetch } from "../../utils/api";
import StatusBadge from "./StatusBadge";

const STATUS = ["pending", "processing", "shipped", "out-for-delivery", "delivered", "cancelled"];

export default function OrdersManager({ socket }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/orders/admin/all");
      setOrders(res.data.orders || []);
    } catch (e) {
      setError(e.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (orderId, status) => {
    setSavingId(orderId);
    try {
      const res = await apiFetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      const updated = res.data.order;
      setOrders((prev) => prev.map((o) => (o._id === orderId ? updated : o)));
      alert(`Order ${orderId} updated to ${status}`);
    } catch (e) {
      alert(e.message || "Failed to update status");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-[#1e3a8a]">All Orders</h2>
        <button
          onClick={loadOrders}
          className="px-3 py-2 text-sm bg-blue-600 text-white rounded"
        >
          Refresh
        </button>
      </div>
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="p-3 text-left">Order ID</th>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-right">Total</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Updated</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id} className="border-t">
                <td className="p-3">{o.orderNumber || o._id}</td>
                <td className="p-3">{o.userId}</td>
                <td className="p-3 text-right">₹{Number(o.total || 0).toFixed(2)}</td>
                <td className="p-3">
                  <StatusBadge status={o.status} />
                </td>
                <td className="p-3">
                  {o.updatedAt ? new Date(o.updatedAt).toLocaleString() : "-"}
                </td>
                <td className="p-3">
                  <select
                    className="border rounded px-2 py-1"
                    defaultValue={o.status}
                    disabled={savingId === o._id}
                    onChange={(e) => updateStatus(o._id, e.target.value)}
                  >
                    {STATUS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-500">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
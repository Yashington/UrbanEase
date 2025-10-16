import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { SocketContext } from "../App";

const CACHE_KEY = "notifications_cache_v2";
const API_BASE = process.env.REACT_APP_API_URL || "https://urbanease-backend.onrender.com";
const API_URL = `${API_BASE}/api/notifications`;

export default function Notifications() {
  const socket = useContext(SocketContext);

  const [items, setItems] = useState(() => {
    // warm UI with cached notifications while we fetch the real list
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // auth header
  const token = localStorage.getItem("accessToken");
  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    }),
    [token]
  );

  // Fetch notifications from backend (with unread count support on server)
  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await fetch(`${API_URL}?page=1&limit=50`, {
        headers,
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list =
        data?.data?.notifications && Array.isArray(data.data.notifications)
          ? data.data.notifications
          : [];
      // normalize for UI (ensure id and timestamp keys)
      const normalized = list.map((n) => ({
        id: String(n._id || n.id || `${Date.now()}`),
        title: n.title || "Notification",
        message: n.message || "",
        read: !!n.read,
        createdAt: n.createdAt || n.timestamp || new Date().toISOString(),
        type: n.type || "order-status",
        order: n.order || n.meta?.orderId || null,
        status: n.status || n.meta?.status || "",
        raw: n,
      }));
      setItems(normalized);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(normalized));
      } catch {}
    } catch (e) {
      setErr("Failed to load notifications. Showing last cached items (if any).");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for realtime notifications
  useEffect(() => {
    if (!socket) return;

    // New structured notification from backend
    const onNew = (n) => {
      const item = {
        id: String(n._id || `${Date.now()}-${Math.random().toString(36).slice(2)}`),
        title: n.title || "Notification",
        message: n.message || "",
        read: false,
        createdAt: n.createdAt || new Date().toISOString(),
        type: n.type || "order-status",
        order: n.order || null,
        status: n.status || "",
        raw: n,
      };
      setItems((prev) => [item, ...prev]);
    };

    // Backward-compat event your app already emits
    const onLegacyOrderUpdate = (data) => {
      const item = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type: "order-status",
        title: "Order status update",
        message: `Order ${data.orderId} is now ${data.status}`,
        createdAt: new Date().toISOString(),
        read: false,
        order: data.orderId,
        status: data.status,
        raw: data,
      };
      setItems((prev) => [item, ...prev]);
    };

    socket.on("notification:new", onNew);
    socket.on("order status update", onLegacyOrderUpdate);

    return () => {
      socket.off("notification:new", onNew);
      socket.off("order status update", onLegacyOrderUpdate);
    };
  }, [socket]);

  // Persist to cache on change (so UI is instant on next load)
  const hasMounted = useRef(false);
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  // Actions
  const markRead = async (id) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await fetch(`${API_URL}/${id}/read`, {
        method: "PATCH",
        headers,
        credentials: "include",
      });
    } catch {
      // ignore; UI already updated
    }
  };

  const markAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await fetch(`${API_URL}/mark-all-read`, {
        method: "POST",
        headers,
        credentials: "include",
      });
    } catch {
      // ignore; UI already updated
    }
  };

  // Clear all only clears local cache/UI. Server does not delete notifications.
  const clearAll = () => {
    if (!window.confirm("Clear all notifications from this device?")) return;
    setItems([]);
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch {}
  };

  return (
    <div className="min-h-screen pt-[90px]">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6 mt-6 border">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-[#1e3a8a]">Notifications</h1>
          <div className="flex gap-2">
            <button
              onClick={markAllRead}
              className="px-3 py-2 text-sm border rounded hover:bg-gray-50"
            >
              Mark all read
            </button>
            <button
              onClick={clearAll}
              className="px-3 py-2 text-sm border rounded text-red-600 hover:bg-red-50"
              title="Clears local cache only"
            >
              Clear all
            </button>
          </div>
        </div>

        {loading && (
          <div className="mt-4 text-gray-600">Loading notifications…</div>
        )}
        {err && !loading && (
          <div className="mt-3 text-sm text-red-600">{err}</div>
        )}

        <ul className="mt-4 divide-y">
          {items.map((n) => (
            <li key={n.id} className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{n.title}</div>
                  <div className="text-sm text-gray-700">{n.message}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(n.createdAt).toLocaleString()}
                    {n.status ? ` • ${n.status}` : ""}
                  </div>
                  {n.order && (
                    <div className="mt-2 text-sm">
                      <a
                        href="/orders"
                        className="text-blue-600 hover:underline"
                        onClick={() => markRead(n.id)}
                      >
                        View orders
                      </a>
                    </div>
                  )}
                </div>
                {!n.read ? (
                  <button
                    className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 h-fit"
                    onClick={() => markRead(n.id)}
                    title="Mark as read"
                  >
                    New
                  </button>
                ) : (
                  <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-500 h-fit">
                    Read
                  </span>
                )}
              </div>
            </li>
          ))}
          {!loading && items.length === 0 && (
            <li className="py-10 text-center text-gray-500">
              No notifications yet.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
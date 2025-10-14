import React, { useContext, useEffect, useRef, useState } from "react";
import { SocketContext } from "../App";

const STORAGE_KEY = "notifications";

export default function Notifications() {
  const socket = useContext(SocketContext);
  const [notifications, setNotifications] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!socket) return;
    const handler = (data) => {
      const item = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type: "order-status",
        title: "Order status update",
        message: `Order ${data.orderId} is now ${data.status}`,
        timestamp: new Date().toISOString(),
        read: false,
        meta: data,
      };
      setNotifications((prev) => [item, ...prev]);
    };
    socket.on("order status update", handler);
    return () => socket.off("order status update", handler);
  }, [socket]);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };
  const clearAll = () => {
    if (!window.confirm("Clear all notifications?")) return;
    setNotifications([]);
  };

  return (
    <div className="min-h-screen pt-[90px]">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6 mt-6 border">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#1e3a8a]">Notifications</h1>
          <div className="flex gap-2">
            <button onClick={markAllRead} className="px-3 py-2 text-sm border rounded">
              Mark all read
            </button>
            <button onClick={clearAll} className="px-3 py-2 text-sm border rounded text-red-600">
              Clear all
            </button>
          </div>
        </div>

        <ul className="mt-4 divide-y">
          {notifications.map((n) => (
            <li key={n.id} className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{n.title}</div>
                  <div className="text-sm text-gray-700">{n.message}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(n.timestamp).toLocaleString()}
                  </div>
                </div>
                {!n.read && (
                  <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 h-fit">
                    New
                  </span>
                )}
              </div>
            </li>
          ))}
          {notifications.length === 0 && (
            <li className="py-10 text-center text-gray-500">No notifications yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
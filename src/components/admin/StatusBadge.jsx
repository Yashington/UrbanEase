import React from "react";

const map = {
  pending: "bg-gray-200 text-gray-800",
  processing: "bg-yellow-100 text-yellow-800",
  shipped: "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function StatusBadge({ status = "pending" }) {
  const cls = map[status] || map.pending;
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded ${cls}`}>
      {status}
    </span>
  );
}
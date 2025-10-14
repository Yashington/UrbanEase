import React from "react";

/**
 * OrderStatusTimeline
 * Renders an Amazon-like status flow: Ordered -> Shipped -> Out for delivery -> Delivered
 * Supports: pending, processing, shipped, out-for-delivery, delivered, cancelled
 */
const steps = [
  { key: "ordered", label: "Ordered" },
  { key: "shipped", label: "Shipped" },
  { key: "out-for-delivery", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" },
];

const statusIndex = (status) => {
  const map = {
    pending: 0, // show "Ordered" as completed as soon as order exists
    processing: 0,
    shipped: 1,
    "out-for-delivery": 2,
    delivered: 3,
    cancelled: -1, // handled separately
  };
  return map[status] ?? 0;
};

const CheckIcon = () => (
  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white text-xs">✓</span>
);
const DotIcon = () => (
  <span className="flex items-center justify-center w-2 h-2 rounded-full bg-blue-500"></span>
);

export default function OrderStatusTimeline({ status = "pending", arrivingText = "Arriving today" }) {
  const idx = statusIndex(status);

  if (status === "cancelled") {
    return (
      <div className="p-4 rounded-lg border bg-red-50 border-red-200 text-red-700">
        Order cancelled
      </div>
    );
  }

  return (
    <div className="relative p-4 rounded-lg border bg-white">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-[#1e3a8a]">
          {status === "delivered" ? "Delivered" : arrivingText}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vertical Steps */}
        <div className="relative">
          {/* vertical line */}
          <div className="absolute left-3 top-3 bottom-3 w-[2px] bg-gray-200" />
          <ul className="space-y-6">
            {steps.map((s, i) => {
              const isDone = i <= idx;
              const isCurrent = i === idx;
              return (
                <li key={s.key} className="relative pl-10">
                  <div className="absolute left-0 top-0">
                    {isDone ? <CheckIcon /> : isCurrent ? <DotIcon /> : <span className="w-6 h-6 block rounded-full border border-gray-300 bg-white"></span>}
                  </div>
                  <div className={`font-medium ${isDone ? "text-gray-900" : "text-gray-600"}`}>
                    {s.label}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right-side meta (example placeholders) */}
        <div className="text-sm text-gray-700 space-y-2">
          <div className="font-semibold">Delivery by UrbanEase</div>
          <div>Tracking: Available after shipping</div>
          <div>Tip: You’ll get live updates here when the status changes.</div>
        </div>
      </div>
    </div>
  );
}
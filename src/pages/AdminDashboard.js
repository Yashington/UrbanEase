import React, { useState, useContext } from "react";
import OrdersManager from "../components/admin/OrdersManager";
import ProductsManager from "../components/admin/ProductsManager";
import { SocketContext } from "../App";

export default function AdminDashboard() {
  const [tab, setTab] = useState("orders"); // "orders" | "products"
  const socket = useContext(SocketContext);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef2ff] via-[#e0e7ff] to-[#c7d2fe] py-10">
      <div className="max-w-6xl mx-auto bg-white border rounded-2xl shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#1e3a8a]">Admin Dashboard</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setTab("orders")}
              className={`px-4 py-2 rounded-lg border ${
                tab === "orders"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-blue-600 border-blue-300"
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setTab("products")}
              className={`px-4 py-2 rounded-lg border ${
                tab === "products"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-blue-600 border-blue-300"
              }`}
            >
              Products
            </button>
          </div>
        </div>

        {tab === "orders" ? (
          <OrdersManager socket={socket} />
        ) : (
          <ProductsManager />
        )}
      </div>
    </div>
  );
}
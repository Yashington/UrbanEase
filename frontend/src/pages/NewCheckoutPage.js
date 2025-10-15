import React, { useState, useEffect, useContext, useMemo } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../App"; // <-- SocketContext for realtime

const API_URL = "http://localhost:5000/api/orders";

// Helper for protected API requests
const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem("accessToken");
  const headers = {
    ...(options.headers || {}),
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return fetch(url, { ...options, headers });
};

export default function NewCheckoutPage() {
  const { cart } = useCart(); // Do NOT clear cart here; only after payment success/COD
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderStatusUpdate, setOrderStatusUpdate] = useState(null);
  const socket = useContext(SocketContext);

  const user = useMemo(
    () => ({
      name: "Yash Chikhale",
      address: "123 Main St, Mumbai, India",
      phone: "+91-1234567890",
      email: "yashchikhale20@gmail.com",
    }),
    []
  );

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0),
    [cart]
  );

  // Join the user's room for order updates when component mounts
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId && socket) {
      socket.emit("join", userId);
    }
  }, [socket]);

  // Listen for real-time order status updates
  useEffect(() => {
    if (!socket) return;
    const handleOrderStatusUpdate = (data) => setOrderStatusUpdate(data);
    socket.on("order status update", handleOrderStatusUpdate);
    return () => socket.off("order status update", handleOrderStatusUpdate);
  }, [socket]);

  // Show real-time order status update toast/alert
  useEffect(() => {
    if (orderStatusUpdate) {
      alert(`Order ${orderStatusUpdate.orderId} status updated: ${orderStatusUpdate.status}`);
      setOrderStatusUpdate(null);
    }
  }, [orderStatusUpdate]);

  // Create a pending order and redirect to payment step
  const handleProceedToPayment = async () => {
    setLoading(true);
    setError("");

    try {
      const accessToken = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("userId") || "guest";

      if (!accessToken) {
        setError("Please login to continue to payment");
        setLoading(false);
        return;
      }

      const orderData = {
        userId,
        products: cart.map((item) => ({
          productId: item.productId || item._id || item.id,
          quantity: Number(item.quantity),
          price: Number(item.price),
          title: item.title,
          image: item.image,
          category: item.category,
        })),
        total: Number(total.toFixed(2)),
        // We will pick final method on the Payment page (Razorpay/COD)
        paymentMethod: "online",
        shippingAddress: {
          name: user.name,
          address: user.address,
          phone: user.phone,
          email: user.email,
        },
      };

      const response = await apiFetch(API_URL, {
        method: "POST",
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok || !data?.success || !data?.data?.orderId) {
        throw new Error(data?.message || "Failed to create order");
      }

      const orderId = data.data.orderId;

      // IMPORTANT: Do NOT clear the cart here.
      // Cart will be cleared after a successful online payment or COD selection on the Payment page.
      navigate(`/checkout/payment/${orderId}`);
    } catch (err) {
      console.error("Proceed to payment error:", err);
      setError(err.message || "Failed to create order. Please try again.");
      // If token expired, redirect to login
      const msg = (err.message || "").toLowerCase();
      if (msg.includes("token") || msg.includes("unauthorized") || msg.includes("jwt")) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/auth");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#dbeafe] via-[#bfdbfe] to-[#93c5fd] py-12">
        <div className="bg-white rounded-xl shadow p-10 text-center text-[#2563eb]">
          Your cart is empty.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#dbeafe] via-[#bfdbfe] to-[#93c5fd] py-12">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl px-8 py-10 border border-blue-200">
        <h2 className="text-3xl font-bold mb-6 text-[#2563eb] tracking-wider">CHECKOUT</h2>
        <p className="text-gray-600 mb-8">
          Review your order & delivery details, then proceed to payment.
        </p>

        {error && (
          <div className="mb-6 px-4 py-3 text-red-600 bg-red-50 border border-red-200 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Delivery Address */}
          <div className="col-span-1">
            <h3 className="text-xl font-bold text-[#2563eb] mb-3">DELIVERY ADDRESS</h3>
            <div className="bg-gray-50 rounded-lg p-5 mb-4 shadow">
              <div className="font-semibold">{user.name}</div>
              <div className="text-gray-600">{user.address}</div>
              <div className="text-gray-600">Phone: {user.phone}</div>
              <div className="text-gray-600">Email: {user.email}</div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="col-span-1">
            <h3 className="text-xl font-bold text-[#2563eb] mb-3">PAYMENT</h3>
            <div className="bg-gray-50 rounded-lg p-5 mb-4 shadow">
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Delivery</span>
                <span>₹0.00</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-bold text-lg text-green-700">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
            <button
              className={`w-full py-3 mt-4 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 font-semibold text-lg transition-colors ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleProceedToPayment}
              disabled={loading}
            >
              {loading ? "Creating Order..." : "Proceed to Payment"}
            </button>
          </div>

          {/* Order Summary */}
          <div className="col-span-1">
            <h3 className="text-xl font-bold text-[#2563eb] mb-3">ORDER SUMMARY</h3>
            <div className="bg-gray-50 rounded-lg p-5 shadow">
              <ul className="divide-y">
                {cart.map((item) => (
                  <li key={item.productId || item._id || item.id} className="py-4 flex gap-4 items-center">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-14 h-14 rounded object-cover border"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-[#22223B]">{item.title}</div>
                      <div className="text-gray-500 text-sm">{item.category}</div>
                      <div className="text-blue-600 text-xs">Qty: {item.quantity}</div>
                    </div>
                    <div className="ml-auto font-bold text-[#2563eb]">
                      ₹{(Number(item.price) * Number(item.quantity)).toFixed(2)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
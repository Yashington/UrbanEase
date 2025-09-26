import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api/orders";

export default function NewCheckoutPage() {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [error, setError] = useState("");

  const user = {
    name: "Yash Chikhale",
    address: "123 Main St, Mumbai, India",
    phone: "+91-1234567890",
    email: "yashchikhale20@gmail.com"
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError("");
    
    try {
      const userId = localStorage.getItem("userId") || "guest";
      const orderData = {
        userId,
        products: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
          title: item.title,
          image: item.image,
          category: item.category,
        })),
        total,
        date: new Date().toISOString(),
        status: "pending",
        shippingAddress: {
          name: user.name,
          address: user.address,
          phone: user.phone,
          email: user.email
        }
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to place order");
      }

      await clearCart();
      setOrderSuccess(true);
    } catch (err) {
      console.error("Order placement error:", err);
      setError(err.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
        <div className="bg-white rounded-2xl shadow-xl px-10 py-14 border border-green-300 text-center flex flex-col items-center">
          <svg width="64" height="64" fill="none" stroke="green" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="green" strokeWidth="2" fill="#e6ffe6"/>
            <path d="M7 13l3 3 7-7" stroke="green" strokeWidth="2" fill="none"/>
          </svg>
          <h2 className="text-2xl font-semibold text-green-700 mt-4 mb-2">Order placed successfully!</h2>
          <p className="text-lg text-gray-700 mb-2">Thank you for shopping with us.</p>
          <button
            className="mt-6 px-6 py-3 bg-green-600 text-white rounded shadow hover:bg-green-700"
            onClick={() => navigate("/products")}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

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
        <p className="text-gray-600 mb-8">Review your order & delivery details before placing your order.</p>
        
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
            <div className="text-sm text-gray-400 mt-2">Edit address in your profile settings.</div>
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
              <hr className="my-2"/>
              <div className="flex justify-between font-bold text-lg text-green-700">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
            <button
              className={`w-full py-3 mt-4 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 font-semibold text-lg transition ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={handlePlaceOrder}
              disabled={loading}
            >
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </div>

          {/* Order Summary */}
          <div className="col-span-1">
            <h3 className="text-xl font-bold text-[#2563eb] mb-3">ORDER SUMMARY</h3>
            <div className="bg-gray-50 rounded-lg p-5 shadow">
              <ul className="divide-y">
                {cart.map(item => (
                  <li key={item.id} className="py-4 flex gap-4 items-center">
                    <img src={item.image} alt={item.title} className="w-14 h-14 rounded object-cover border" />
                    <div className="flex-1">
                      <div className="font-semibold text-[#22223B]">{item.title}</div>
                      <div className="text-gray-500 text-sm">{item.category}</div>
                      <div className="text-blue-600 text-xs">Qty: {item.quantity}</div>
                    </div>
                    <div className="ml-auto font-bold text-[#2563eb]">₹{(item.price * item.quantity).toFixed(2)}</div>
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
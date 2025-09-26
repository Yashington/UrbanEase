import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { FaTimes, FaHeart } from "react-icons/fa";

function CartPage() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const [favorites, setFavorites] = useState({});

  const emptyCartImg =
    "https://cdn-icons-png.flaticon.com/512/2038/2038854.png";
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#dbeafe] via-[#bfdbfe] to-[#93c5fd] py-12">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl px-8 py-12 border border-blue-200 flex flex-col items-center">
          <img src={emptyCartImg} alt="Cart is empty" className="w-36 h-36 mb-6 opacity-70" />
          <div className="text-[#2563eb] text-xl font-medium text-center">Your cart is empty.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#dbeafe] via-[#bfdbfe] to-[#93c5fd] py-12">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl px-8 py-10 border border-blue-200">
        <h2 className="text-3xl font-bold mb-6 text-[#2563eb] tracking-wider">SHOPPING BAG</h2>
        <hr className="mb-6"/>
        <div className="space-y-4">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex items-center rounded-xl bg-white px-6 py-4 shadow-sm hover:shadow-lg transition group border border-gray-200"
              style={{
                boxShadow: "0 2px 8px rgba(37,99,235,0.08)",
                marginBottom: "8px",
              }}
            >
              {/* Remove */}
              <button
                className="text-2xl text-[#7f9cf5] hover:text-red-500 mr-4 transition"
                title="Remove"
                onClick={() => removeFromCart(item.id)}
                style={{ background: "none", border: "none" }}
              >
                <FaTimes />
              </button>

              {/* Favorite */}
              <button
                className="text-xl mr-4 transition"
                style={{
                  color: favorites[item.id] ? "#e53e3e" : "#a0aec0",
                  background: "none",
                  border: "none",
                }}
                title="Favorite"
                onClick={() => toggleFavorite(item.id)}
              >
                <FaHeart />
              </button>

              {/* Product Image */}
              <img
                src={item.image}
                alt={item.title}
                className="w-16 h-16 rounded object-cover border mr-6 shadow"
                style={{ background: "#f5f6fa" }}
              />

              {/* Product Info */}
              <div className="flex-1">
                <div className="font-medium text-lg text-[#22223B] mb-1">{item.title}</div>
                <div className="text-gray-500 text-sm">{item.category || "—"}</div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-2 mx-6">
                <button
                  className="w-8 h-8 rounded bg-blue-100 text-blue-700 text-lg font-bold hover:bg-blue-200 border shadow-sm"
                  onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                  aria-label="Increase quantity"
                  style={{ minWidth: "32px" }}
                >
                  +
                </button>
                <span className="font-semibold text-lg text-[#2563eb] mx-2" style={{ minWidth: "20px", textAlign: "center" }}>
                  {item.quantity || 1}
                </span>
                <button
                  className="w-8 h-8 rounded bg-blue-100 text-blue-700 text-lg font-bold hover:bg-blue-200 border shadow-sm"
                  onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                  aria-label="Decrease quantity"
                  disabled={item.quantity <= 1}
                  style={{ minWidth: "32px" }}
                >
                  –
                </button>
              </div>

              {/* Price */}
              <div className="font-bold text-lg text-[#22223B] ml-4 w-24 text-right">
                ₹{(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* Cart Actions */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-10 gap-4">
          <div className="text-xl font-semibold text-[#2563eb]">
            Total: <span className="font-bold">₹{total.toFixed(2)}</span>
          </div>
          <div className="flex gap-4">
            <button
              className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 font-semibold transition text-lg"
              onClick={() => navigate("/checkout")}
              style={{ letterSpacing: "1px" }}
            >
              Proceed to Checkout
            </button>
            <button
              className="px-6 py-3 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 font-semibold transition text-lg"
              onClick={clearCart}
              style={{ letterSpacing: "1px" }}
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";

function CartPage() {
  const { cartItems = [], removeFromCart } = useCart() || {};
  // Manage quantity locally for demo; ideally, this should be in context if you want persistence
  const [quantities, setQuantities] = useState(() =>
    cartItems.reduce((acc, item) => ({ ...acc, [item.id]: 1 }), {})
  );

  // Sync quantities with cart changes
  useEffect(() => {
    setQuantities((prev) => {
      const updated = { ...prev };
      cartItems.forEach((item) => {
        if (!(item.id in updated)) updated[item.id] = 1;
      });
      Object.keys(updated).forEach((id) => {
        if (!cartItems.some((item) => item.id === Number(id))) delete updated[id];
      });
      return updated;
    });
  }, [cartItems]);

  const handleQuantityChange = (id, delta) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta),
    }));
  };

  // Demo favorite toggle (not persistent)
  const [favorites, setFavorites] = useState({});
  const toggleFavorite = (id) => {
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Cart empty image URL
  const emptyCartImg =
    "https://cdn-icons-png.flaticon.com/512/2038/2038854.png";

  if (!Array.isArray(cartItems)) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[50vh]">
        <div className="text-red-600 font-bold text-xl mb-4">
          Cart context not available. Please login or reload the page.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#dbeafe] via-[#bfdbfe] to-[#93c5fd] py-12">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl px-6 py-8 border border-blue-200">
        <h2 className="text-2xl font-semibold mb-6 border-b pb-3 text-[#2563eb]">Shopping Bag</h2>
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <img
              src={emptyCartImg}
              alt="Cart is empty"
              className="w-36 h-36 mb-6 opacity-70"
            />
            <div className="text-center text-[#2563eb] text-xl font-medium">Your cart is empty.</div>
          </div>
        ) : (
          <table className="w-full">
            <tbody>
              {cartItems.map((item) => (
                <tr
                  key={item.id}
                  className="border-b last:border-b-0 hover:bg-blue-50 transition"
                >
                  <td className="px-2 py-6 text-center">
                    {/* Remove button */}
                    <button
                      className="text-gray-400 hover:text-red-500 text-xl"
                      title="Remove"
                      onClick={() => removeFromCart(item.id)}
                    >
                      &#10006;
                    </button>
                  </td>
                  <td className="px-2 py-6 text-center">
                    {/* Favorite button (demo) */}
                    <button
                      className={`text-xl ${favorites[item.id] ? "text-red-500" : "text-gray-300"} hover:text-red-500`}
                      title="Favorite"
                      onClick={() => toggleFavorite(item.id)}
                    >
                      &#10084;
                    </button>
                  </td>
                  <td className="px-2 py-6">
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-20 h-20 rounded object-cover border"
                    />
                  </td>
                  <td className="px-2 py-6 w-[230px]">
                    <div className="font-semibold text-[#22223B]">{item.name}</div>
                    <div className="text-gray-500 text-sm">{item.brand || "—"}</div>
                  </td>
                  <td className="px-2 py-6 w-[120px]">
                    {/* Quantity controls */}
                    <div className="flex items-center gap-2">
                      <button
                        className="w-8 h-8 rounded bg-blue-100 text-blue-700 text-lg font-bold hover:bg-blue-200 border"
                        onClick={() => handleQuantityChange(item.id, 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                      <span className="font-semibold text-lg text-[#2563eb]">{quantities[item.id] || 1}</span>
                      <button
                        className="w-8 h-8 rounded bg-blue-100 text-blue-700 text-lg font-bold hover:bg-blue-200 border"
                        onClick={() => handleQuantityChange(item.id, -1)}
                        aria-label="Decrease quantity"
                        disabled={quantities[item.id] <= 1}
                      >
                        –
                      </button>
                    </div>
                  </td>
                  <td className="px-2 py-6 text-right font-semibold text-[#22223B] text-lg w-[90px]">
                    ₹{item.price}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default CartPage;
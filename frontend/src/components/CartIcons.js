import React from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { useNavigate } from "react-router-dom";

function CartIcon() {
  const [cart, setCart] = useLocalStorage("cart", []);
  const navigate = useNavigate();

  // Calculate total items and optionally total price
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  // Remove all items from cart
  const clearCart = () => setCart([]);

  // Remove a single item
  const removeItem = (id) => setCart(cart.filter(item => item.id !== id));

  return (
    <div className="relative inline-block">
      {/* Cart icon + Badge */}
      <button
        onClick={() => navigate("/cart")}
        className="flex items-center gap-2 bg-blue-100 px-3 py-1 rounded-full hover:bg-blue-200 transition"
      >
        <span role="img" aria-label="cart" className="text-xl">🛒</span>
        <span className="font-semibold text-blue-700">
          {totalItems} item{totalItems !== 1 ? "s" : ""}
        </span>
      </button>

      {/* Dropdown (example, can customize further) */}
      {cart.length > 0 && (
        <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg border rounded-lg z-50 p-3">
          <h4 className="font-semibold mb-2 text-gray-700">Cart Preview</h4>
          <ul>
            {cart.map(item => (
              <li key={item.id} className="flex justify-between items-center mb-1">
                <span>
                  {item.name}
                  {item.quantity && item.quantity > 1 ? ` ×${item.quantity}` : ""}
                </span>
                <button
                  className="text-red-500 text-xs ml-2"
                  onClick={() => removeItem(item.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex justify-between items-center text-sm">
            <span className="font-medium">Total: </span>
            <span className="font-bold">Rs {totalPrice}/-</span>
          </div>
          <button
            className="mt-3 w-full bg-red-100 text-red-600 py-1 rounded hover:bg-red-200 transition"
            onClick={clearCart}
          >
            Clear Cart
          </button>
          <button
            className="mt-2 w-full bg-blue-600 text-white py-1 rounded hover:bg-blue-700 transition"
            onClick={() => navigate("/cart")}
          >
            Go to Cart
          </button>
        </div>
      )}
    </div>
  );
}

export default CartIcon;
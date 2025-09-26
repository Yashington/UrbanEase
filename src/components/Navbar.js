import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavbarLogo from "./NavbarLogo";
import { FaUserCircle, FaShoppingCart } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { useCart } from "../context/CartContext";

function Navbar({ isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const firstMenuRef = useRef(null);

  // Get cart from context
  const { cart, clearCart } = useCart();

  useEffect(() => {
    if (menuOpen && firstMenuRef.current) {
      firstMenuRef.current.focus();
    }
  }, [menuOpen]);

  // Remove blue horizontal box by removing any extra divs or elements below navbar
  // (No additional elements needed here!)

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.setItem("isLoggedIn", "false");
    clearCart(); // Clear cart on logout
    localStorage.removeItem("cart");
    navigate("/");
  };

  const handleMenuToggle = () => setMenuOpen((open) => !open);

  useEffect(() => {
    function handleKeyDown(e) {
      if (menuOpen && e.key === "Escape") {
        setMenuOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  return (
    <nav
      className="w-full h-[90px] flex items-center justify-between px-12 py-7 bg-[#f6f9fd] shadow-sm fixed top-0 left-0 z-50"
      role="navigation"
      aria-label="Main navigation"
    >
      <Link to="/" className="flex items-center gap-2" aria-label="Home">
        <NavbarLogo />
      </Link>
      {/* Mobile menu toggle button (visible on small screens) */}
      <button
        className="md:hidden text-3xl text-[#2563eb]"
        onClick={handleMenuToggle}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        aria-controls="main-menu"
      >
        ☰
      </button>
      <ul
        id="main-menu"
        className={`flex gap-12 text-xl font-[sans-serif] text-[#22223B] font-medium items-center ${
          menuOpen ? "block" : "hidden md:flex"
        }`}
        role="menubar"
      >
        <li role="none">
          <Link
            to="/"
            className="hover:text-[#2563eb] transition"
            ref={firstMenuRef}
            role="menuitem"
            tabIndex={menuOpen ? 0 : undefined}
            aria-label="Home"
          >
            Home
          </Link>
        </li>
        <li role="none">
          <Link to="/featured" className="hover:text-[#2563eb] transition" role="menuitem" aria-label="Featured">
            Featured
          </Link>
        </li>
        <li role="none">
          <Link to="/products" className="hover:text-[#2563eb] transition" role="menuitem" aria-label="Products">
            Products
          </Link>
        </li>
        {isLoggedIn && (
          <>
            <li className="relative" role="none">
              <Link
                to="/cart"
                className="hover:text-[#2563eb] transition flex items-center gap-1"
                role="menuitem"
                aria-label="View Cart"
              >
                <FaShoppingCart className="text-2xl" aria-hidden="true" />
                {/* Cart badge */}
                {cart.length > 0 && (
                  <span
                    className="absolute -top-2 -right-4 bg-[#2563eb] text-white text-xs px-2 rounded-full"
                    aria-label={`${cart.length} items in cart`}
                  >
                    {cart.length}
                  </span>
                )}
              </Link>
            </li>
            <li role="none">
              <button
                onClick={handleLogout}
                className="hover:text-[#2563eb] transition bg-transparent border-none cursor-pointer flex items-center"
                style={{ font: "inherit" }}
                aria-label="Logout"
                role="menuitem"
              >
                <FiLogOut className="text-2xl" aria-hidden="true" />
              </button>
            </li>
          </>
        )}
        {!isLoggedIn && (
          <li role="none">
            <button
              onClick={() => navigate("/auth")}
              className="bg-transparent border-none cursor-pointer flex items-center"
              aria-label="User Login / Signup"
              role="menuitem"
            >
              <FaUserCircle className="text-3xl text-[#2563eb] hover:text-[#1d4ed8] transition" aria-hidden="true" />
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
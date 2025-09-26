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

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.setItem("isLoggedIn", "false");
    clearCart();
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
      className="w-full h-[90px] flex items-center justify-between px-12 py-7 bg-white shadow-lg fixed top-0 left-0 z-50 border-b border-gray-100"
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
            className="hover:text-[#2563eb] transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-blue-50"
            ref={firstMenuRef}
            role="menuitem"
            tabIndex={menuOpen ? 0 : undefined}
            aria-label="Home"
          >
            Home
          </Link>
        </li>
        <li role="none">
          <Link 
            to="/featured" 
            className="hover:text-[#2563eb] transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-blue-50" 
            role="menuitem" 
            aria-label="Featured"
          >
            Featured
          </Link>
        </li>
        <li role="none">
          <Link 
            to="/products" 
            className="hover:text-[#2563eb] transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-blue-50" 
            role="menuitem" 
            aria-label="Products"
          >
            Products
          </Link>
        </li>
        
        {isLoggedIn && (
          <>
            <li className="relative" role="none">
              <Link
                to="/cart"
                className="hover:text-[#2563eb] transition-colors duration-200 flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-blue-50"
                role="menuitem"
                aria-label="View Cart"
              >
                <FaShoppingCart className="text-2xl" aria-hidden="true" />
                {cart.length > 0 && (
                  <span
                    className="absolute -top-2 -right-4 bg-[#2563eb] text-white text-xs px-2 rounded-full min-w-[20px] h-5 flex items-center justify-center"
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
                className="hover:text-[#2563eb] transition-colors duration-200 bg-transparent border-none cursor-pointer flex items-center px-3 py-2 rounded-lg hover:bg-blue-50"
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
              className="border-2 border-[#2563eb] text-[#2563eb] bg-transparent px-6 py-2 rounded-full font-semibold transition-all duration-200 hover:bg-[#2563eb] hover:text-white flex items-center gap-2"
              aria-label="User Login / Signup"
              role="menuitem"
            >
              <FaUserCircle className="text-xl" aria-hidden="true" />
              Sign In
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
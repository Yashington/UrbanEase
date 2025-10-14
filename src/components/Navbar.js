import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavbarLogo from "./NavbarLogo";
import { FaUserCircle, FaShoppingCart } from "react-icons/fa";
import { useCart } from "../context/CartContext";

function Navbar({ isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const firstMenuRef = useRef(null);
  const userMenuRef = useRef(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const { cart, clearCart } = useCart();

  useEffect(() => {
    if (menuOpen && firstMenuRef.current) {
      firstMenuRef.current.focus();
    }
  }, [menuOpen]);

  useEffect(() => {
    let cancelled = false;
    async function checkRole() {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          if (!cancelled) setIsAdmin(false);
          return;
        }
        const res = await fetch("http://localhost:5000/api/auth/profile", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          if (!cancelled) setIsAdmin(false);
          return;
        }
        const data = await res.json();
        const role = data?.data?.user?.role;
        if (!cancelled) setIsAdmin(role === "admin" || role === "moderator");
      } catch {
        if (!cancelled) setIsAdmin(false);
      }
    }
    checkRole();
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  useEffect(() => {
    function onDocClick(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [userMenuOpen]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.setItem("isLoggedIn", "false");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    clearCart();
    localStorage.removeItem("cart");
    setIsAdmin(false);
    setUserMenuOpen(false);
    navigate("/auth");
  };

  return (
    <nav
      className="w-full h-[90px] flex items-center justify-between px-12 py-7 bg-white shadow-none fixed top-0 left-0 z-50 border-b border-blue-100"
      role="navigation"
      aria-label="Main navigation"
    >
      <Link to="/" className="flex items-center gap-2" aria-label="Home">
        <NavbarLogo />
      </Link>

      {/* Mobile menu toggle */}
      <button
        className="md:hidden text-3xl text-[#2563eb]"
        onClick={() => setMenuOpen((o) => !o)}
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

        {isLoggedIn && isAdmin && (
          <li role="none">
            <Link
              to="/admin"
              className="hover:text-[#2563eb] transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-blue-50 font-semibold"
              role="menuitem"
              aria-label="Admin Dashboard"
            >
              Admin
            </Link>
          </li>
        )}

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
              </Link>
            </li>

            {/* User dropdown */}
            <li className="relative" role="none" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50"
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
                aria-label="User Menu"
              >
                <FaUserCircle className="text-2xl text-[#2563eb]" />
              </button>
              {userMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-50"
                >
                  <button
                    role="menuitem"
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate("/profile");
                    }}
                  >
                    User Profile
                  </button>
                  <button
                    role="menuitem"
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate("/notifications");
                    }}
                  >
                    Notifications
                  </button>
                  <button
                    role="menuitem"
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate("/orders");
                    }}
                  >
                    My Orders
                  </button>
                  <div className="border-t my-1" />
                  <button
                    role="menuitem"
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
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
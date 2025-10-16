import React, { useEffect, useRef, useState, useMemo, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavbarLogo from "./NavbarLogo";
import { FaUserCircle, FaShoppingCart } from "react-icons/fa";
import { IoNotificationsOutline } from "react-icons/io5";
import { useCart } from "../context/CartContext";
import { SocketContext } from "../App";

// Use env-based API URL
const API_BASE = process.env.REACT_APP_API_URL || "https://urbanease-backend.onrender.com";

function Navbar({ isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const firstMenuRef = useRef(null);
  const userMenuRef = useRef(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Socket for realtime notifications
  const socket = useContext(SocketContext);

  // Cart
  const { cart, clearCart } = useCart();
  const itemCount = useMemo(() => {
    if (!Array.isArray(cart)) return 0;
    return cart.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0);
  }, [cart]);

  // Notifications unread badge
  const [unread, setUnread] = useState(0);
  const token = localStorage.getItem("accessToken");
  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    }),
    [token]
  );

  useEffect(() => {
    if (menuOpen && firstMenuRef.current) {
      firstMenuRef.current.focus();
    }
  }, [menuOpen]);

  // Check role only when logged in
  useEffect(() => {
    let cancelled = false;
    async function checkRole() {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          if (!cancelled) setIsAdmin(false);
          return;
        }
        const res = await fetch(`${API_BASE}/api/auth/profile`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
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
    if (isLoggedIn) checkRole();
    else setIsAdmin(false);

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  // Load unread notifications and listen for realtime increments
  useEffect(() => {
    let cancelled = false;

    async function loadUnread() {
      if (!isLoggedIn) {
        if (!cancelled) setUnread(0);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/api/notifications/unread-count`, {
          headers,
          credentials: "include",
        });
        if (!res.ok) throw new Error("unread fetch failed");
        const data = await res.json();
        if (!cancelled) setUnread(Number(data?.data?.unread || 0));
      } catch {
        if (!cancelled) setUnread(0);
      }
    }

    loadUnread();

    if (socket) {
      const onNew = () => setUnread((c) => c + 1);
      socket.on("notification:new", onNew);
      return () => socket.off("notification:new", onNew);
    }

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, headers, socket]);

  // Close user menu on outside click
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
    setUnread(0);
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

        {/* Notifications icon (always visible when logged in) */}
        {isLoggedIn && (
          <li className="relative" role="none">
            <Link
              to="/notifications"
              className="hover:text-[#2563eb] transition-colors duration-200 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 relative"
              role="menuitem"
              aria-label={`Notifications${unread > 0 ? ` (${unread})` : ""}`}
            >
              <IoNotificationsOutline className="text-2xl" aria-hidden="true" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-red-600 text-white text-xs w-5 h-5">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
          </li>
        )}

        {/* Show Cart ONLY when logged in AND there are items in cart */}
        {isLoggedIn && itemCount > 0 && (
          <li className="relative" role="none">
            <Link
              to="/cart"
              className="hover:text-[#2563eb] transition-colors duration-200 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 relative"
              role="menuitem"
              aria-label={`View Cart (${itemCount} item${itemCount === 1 ? "" : "s"})`}
            >
              <FaShoppingCart className="text-2xl" aria-hidden="true" />
              <span
                className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-blue-600 text-white text-xs w-5 h-5"
                aria-hidden="true"
              >
                {itemCount}
              </span>
            </Link>
          </li>
        )}

        {isLoggedIn && (
          /* User dropdown */
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
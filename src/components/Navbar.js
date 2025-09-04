import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavbarLogo from "./NavbarLogo";
import { FaUserCircle } from "react-icons/fa";

function Navbar({ isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate();

  // useState: Track whether the mobile menu is open
  const [menuOpen, setMenuOpen] = useState(false);

  // useRef: Reference to the first menu item for accessibility/focus
  const firstMenuRef = useRef(null);

  // useEffect: Focus the menu item when menu is opened
  useEffect(() => {
    if (menuOpen && firstMenuRef.current) {
      firstMenuRef.current.focus();
    }
  }, [menuOpen]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate("/");
  };

  // Example mobile menu toggle handler
  const handleMenuToggle = () => setMenuOpen((open) => !open);

  return (
    <nav className="w-full h-[90px] flex items-center justify-between px-12 py-7 bg-[#f6f9fd] shadow-sm fixed top-0 left-0 z-50">
      <Link to="/" className="flex items-center gap-2">
        <NavbarLogo />
      </Link>
      {/* Mobile menu toggle button (visible on small screens) */}
      <button
        className="md:hidden text-3xl text-[#2563eb]"
        onClick={handleMenuToggle}
        aria-label="Toggle menu"
      >
        ☰
      </button>
      {/* Desktop menu or mobile menu based on menuOpen */}
      <ul
        className={`flex gap-12 text-xl font-[sans-serif] text-[#22223B] font-medium items-center ${
          menuOpen ? "block" : "hidden md:flex"
        }`}
      >
        <li>
          <Link
            to="/"
            className="hover:text-[#2563eb] transition"
            ref={firstMenuRef}
          >
            Home
          </Link>
        </li>
        <li>
          <Link to="/featured" className="hover:text-[#2563eb] transition">
            Featured
          </Link>
        </li>
        <li>
          <Link to="/products" className="hover:text-[#2563eb] transition">
            Products
          </Link>
        </li>
        {isLoggedIn && (
          <>
            <li>
              <Link to="/cart" className="hover:text-[#2563eb] transition">
                Cart
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="hover:text-[#2563eb] transition bg-transparent border-none cursor-pointer"
                style={{ font: "inherit" }}
              >
                Logout
              </button>
            </li>
          </>
        )}
        {!isLoggedIn && (
          <li>
            <button
              onClick={() => navigate("/auth")}
              className="bg-transparent border-none cursor-pointer flex items-center"
              aria-label="User Login / Signup"
            >
              <FaUserCircle className="text-3xl text-[#2563eb] hover:text-[#1d4ed8] transition" />
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
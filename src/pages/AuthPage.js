import React, { useState } from "react";
import { FaFacebookF, FaGoogle, FaLinkedinIn } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const API_URL = "http://localhost:5000/api/auth";

export default function AuthPage({ setIsLoggedIn }) {
  const [isSignIn, setIsSignIn] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { loadCartFromDatabase } = useCart();

  const handleInput = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Login failed");
      
      setIsLoggedIn(true);
      localStorage.setItem("userId", data.user._id);
      
      // Load user's cart from database after login
      await loadCartFromDatabase();
      
      setLoading(false);
      navigate("/");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Signup failed");
      setLoading(false);
      setIsSignIn(true);
      setForm({ name: "", email: "", password: "" });
      setError("Signup successful! Please login.");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#f5f6f8" }}>
      <div className="relative w-[900px] h-[500px] rounded-2xl shadow-2xl overflow-hidden bg-white flex">
        {/* Animated panels */}
        <div
          className={`absolute inset-0 flex transition-transform duration-500 ease-in-out ${isSignIn ? "" : "translate-x-[-100%]"}`}
          style={{ zIndex: 2 }}
        >
          {/* Sign In Panel */}
          <div className="w-1/2 flex flex-col justify-center items-center px-14 bg-white">
            <h2 className="font-bold text-3xl mb-6">Sign in</h2>
            <div className="flex space-x-6 mb-6">
              <button className="bg-gray-100 p-3 rounded-full text-[#2563eb] hover:bg-blue-100">
                <FaFacebookF />
              </button>
              <button className="bg-gray-100 p-3 rounded-full text-[#2563eb] hover:bg-blue-100">
                <FaGoogle />
              </button>
              <button className="bg-gray-100 p-3 rounded-full text-[#2563eb] hover:bg-blue-100">
                <FaLinkedinIn />
              </button>
            </div>
            <div className="text-xs text-gray-500 mb-4">or use your account</div>
            {error && isSignIn && (
              <div className="mb-4 px-4 py-2 text-red-600 bg-red-50 border border-red-200 rounded text-sm w-full text-center">
                {error}
              </div>
            )}
            <form className="w-full flex flex-col" onSubmit={handleSignIn}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="mb-4 px-4 py-3 rounded bg-gray-100 text-lg"
                required
                value={form.email}
                onChange={handleInput}
                disabled={loading}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="mb-4 px-4 py-3 rounded bg-gray-100 text-lg"
                required
                value={form.password}
                onChange={handleInput}
                disabled={loading}
              />
              <div className="text-xs text-[#2563eb] mb-4 cursor-pointer">Forgot your password?</div>
              <button
                type="submit"
                className={`bg-[#2563eb] text-white rounded-full px-8 py-3 font-semibold tracking-wide shadow hover:bg-blue-600 transition text-lg ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={loading}
              >
                {loading ? "Signing in..." : "SIGN IN"}
              </button>
            </form>
          </div>
          {/* Side Panel for Sign Up */}
          <div className="w-1/2 flex flex-col justify-center items-center px-14 bg-gradient-to-br from-[#bfdbfe] to-[#93c5fd] text-white">
            <h2 className="font-bold text-3xl mb-4">Hello, Friend!</h2>
            <p className="mb-10 text-center text-lg font-medium max-w-[300px]">
              Enter your personal details and start your journey with us
            </p>
            <button
              onClick={() => {
                setIsSignIn(false);
                setError("");
                setForm({ name: "", email: "", password: "" });
              }}
              className="border border-white rounded-full px-10 py-3 font-semibold text-white hover:bg-white hover:text-[#2563eb] transition text-lg"
            >
              SIGN UP
            </button>
          </div>
        </div>

        <div
          className={`absolute inset-0 flex transition-transform duration-500 ease-in-out ${isSignIn ? "translate-x-full" : ""}`}
          style={{ zIndex: 1 }}
        >
          {/* Side Panel for Sign In */}
          <div className="w-1/2 flex flex-col justify-center items-center px-14 bg-gradient-to-br from-[#bfdbfe] to-[#93c5fd] text-white">
            <h2 className="font-bold text-3xl mb-4">Welcome Back!</h2>
            <p className="mb-10 text-center text-lg font-medium max-w-[300px]">
              To keep connected with us please login with your personal info
            </p>
            <button
              onClick={() => {
                setIsSignIn(true);
                setError("");
                setForm({ name: "", email: "", password: "" });
              }}
              className="border border-white rounded-full px-10 py-3 font-semibold text-white hover:bg-white hover:text-[#2563eb] transition text-lg"
            >
              SIGN IN
            </button>
          </div>
          {/* Sign Up Panel */}
          <div className="w-1/2 flex flex-col justify-center items-center px-14 bg-white">
            <h2 className="font-bold text-3xl mb-6">Create Account</h2>
            <div className="flex space-x-6 mb-6">
              <button className="bg-gray-100 p-3 rounded-full text-[#2563eb] hover:bg-blue-100">
                <FaFacebookF />
              </button>
              <button className="bg-gray-100 p-3 rounded-full text-[#2563eb] hover:bg-blue-100">
                <FaGoogle />
              </button>
              <button className="bg-gray-100 p-3 rounded-full text-[#2563eb] hover:bg-blue-100">
                <FaLinkedinIn />
              </button>
            </div>
            <div className="text-xs text-gray-500 mb-4">or use your email for registration</div>
            {error && !isSignIn && (
              <div className="mb-4 px-4 py-2 text-red-600 bg-red-50 border border-red-200 rounded text-sm w-full text-center">
                {error}
              </div>
            )}
            <form className="w-full flex flex-col" onSubmit={handleSignUp}>
              <input
                type="text"
                name="name"
                placeholder="Name"
                className="mb-4 px-4 py-3 rounded bg-gray-100 text-lg"
                required
                value={form.name}
                onChange={handleInput}
                disabled={loading}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="mb-4 px-4 py-3 rounded bg-gray-100 text-lg"
                required
                value={form.email}
                onChange={handleInput}
                disabled={loading}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="mb-6 px-4 py-3 rounded bg-gray-100 text-lg"
                required
                value={form.password}
                onChange={handleInput}
                disabled={loading}
              />
              <button
                type="submit"
                className={`bg-[#2563eb] text-white rounded-full px-8 py-3 font-semibold tracking-wide shadow hover:bg-blue-600 transition text-lg ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={loading}
              >
                {loading ? "Signing up..." : "SIGN UP"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
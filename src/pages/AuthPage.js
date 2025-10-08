import React, { useState } from "react";
import { FaFacebookF, FaGoogle, FaLinkedinIn } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api/auth";

export default function AuthPage({ setIsLoggedIn }) {
  const [isSignIn, setIsSignIn] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
      
      if (!data.success) {
        throw new Error(data.message || "Login failed");
      }
      
      localStorage.setItem("accessToken", data.data.accessToken);
      localStorage.setItem("refreshToken", data.data.refreshToken);
      localStorage.setItem("userId", data.data.user._id);
      localStorage.setItem("userRole", data.data.user.role);
      
      setIsLoggedIn(true);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
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
      
      if (!data.success) {
        throw new Error(data.message || "Signup failed");
      }
      
      setIsSignIn(true);
      setForm({ name: "", email: "", password: "" });
      setError("Signup successful! Please login.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent py-12">
      <div className="relative w-[900px] h-[500px] rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center"
        style={{ background: "none" }}>
        <div className="flex w-full h-full" style={{ borderRadius: "20px", overflow: "hidden" }}>
          {/* Sign In Panel */}
          <div className="w-1/2 flex flex-col justify-center items-center px-14"
            style={{ background: "rgba(234,242,254,0.96)" }}>
            <h2 className="font-bold text-3xl mb-6 text-gray-800">Sign in</h2>
            <div className="flex space-x-6 mb-6">
              <button className="bg-gray-100 p-3 rounded-full text-[#2563eb] hover:bg-blue-100 transition-colors">
                <FaFacebookF />
              </button>
              <button className="bg-gray-100 p-3 rounded-full text-[#2563eb] hover:bg-blue-100 transition-colors">
                <FaGoogle />
              </button>
              <button className="bg-gray-100 p-3 rounded-full text-[#2563eb] hover:bg-blue-100 transition-colors">
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
                className="mb-4 px-4 py-3 rounded-lg bg-gray-100 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                value={form.email}
                onChange={handleInput}
                disabled={loading}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="mb-4 px-4 py-3 rounded-lg bg-gray-100 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                value={form.password}
                onChange={handleInput}
                disabled={loading}
              />
              <div className="text-xs text-[#2563eb] mb-4 cursor-pointer hover:underline">Forgot your password?</div>
              <button
                type="submit"
                className={`border-2 border-[#2563eb] text-[#2563eb] bg-white rounded-full px-8 py-3 font-semibold tracking-wide shadow hover:bg-[#2563eb] hover:text-white transition-all duration-200 text-lg ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={loading}
              >
                {loading ? "Signing in..." : "SIGN IN"}
              </button>
            </form>
          </div>
          {/* Sign Up Panel */}
          <div className="w-1/2 flex flex-col justify-center items-center px-14"
            style={{ background: "rgba(116,166,218,0.96)" }}>
            <h2 className="font-bold text-3xl mb-4 text-white">HELLO, FRIEND!</h2>
            <p className="mb-10 text-center text-lg font-medium max-w-[300px] text-white">
              Enter your personal details and start your journey with us
            </p>
            <button
              onClick={() => {
                setIsSignIn(false);
                setError("");
                setForm({ name: "", email: "", password: "" });
              }}
              className="border-2 border-white rounded-full px-10 py-3 font-semibold text-white hover:bg-white hover:text-[#2563eb] transition-all duration-200 text-lg"
            >
              SIGN UP
            </button>
          </div>
        </div>
        {/* Slide-over animation for sign up/sign in */}
        <div
          className={`absolute inset-0 flex transition-transform duration-500 ease-in-out ${isSignIn ? "translate-x-full" : ""}`}
          style={{ zIndex: 1 }}
        >
          {/* Side Panel for Sign In */}
          <div className="w-1/2 flex flex-col justify-center items-center px-14"
            style={{ background: "rgba(116,166,218,0.96)" }}>
            <h2 className="font-bold text-3xl mb-4 text-white">Welcome Back!</h2>
            <p className="mb-10 text-center text-lg font-medium max-w-[300px] text-white">
              To keep connected with us please login with your personal info
            </p>
            <button
              onClick={() => {
                setIsSignIn(true);
                setError("");
                setForm({ name: "", email: "", password: "" });
              }}
              className="border-2 border-white rounded-full px-10 py-3 font-semibold text-white hover:bg-white hover:text-[#2563eb] transition-all duration-200 text-lg"
            >
              SIGN IN
            </button>
          </div>
          {/* Sign Up Form Panel */}
          <div className="w-1/2 flex flex-col justify-center items-center px-14"
            style={{ background: "rgba(234,242,254,0.96)" }}>
            <h2 className="font-bold text-3xl mb-6 text-gray-800">Create Account</h2>
            <div className="flex space-x-6 mb-6">
              <button className="bg-gray-100 p-3 rounded-full text-[#2563eb] hover:bg-blue-100 transition-colors">
                <FaFacebookF />
              </button>
              <button className="bg-gray-100 p-3 rounded-full text-[#2563eb] hover:bg-blue-100 transition-colors">
                <FaGoogle />
              </button>
              <button className="bg-gray-100 p-3 rounded-full text-[#2563eb] hover:bg-blue-100 transition-colors">
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
                className="mb-4 px-4 py-3 rounded-lg bg-gray-100 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                value={form.name}
                onChange={handleInput}
                disabled={loading}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="mb-4 px-4 py-3 rounded-lg bg-gray-100 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                value={form.email}
                onChange={handleInput}
                disabled={loading}
              />
              <input
                type="password"
                name="password"
                placeholder="Password (min. 6 characters)"
                className="mb-6 px-4 py-3 rounded-lg bg-gray-100 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength="6"
                value={form.password}
                onChange={handleInput}
                disabled={loading}
              />
              <button
                type="submit"
                className={`border-2 border-[#2563eb] text-[#2563eb] bg-white rounded-full px-8 py-3 font-semibold tracking-wide shadow hover:bg-[#2563eb] hover:text-white transition-all duration-200 text-lg ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
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
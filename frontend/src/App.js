import React, { useState, lazy, Suspense, useMemo, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Footer from "./components/Footer";
import FeaturedCollection from "./pages/FeaturedCollection";
import ProductsPage from "./pages/ProductsPage";
import CartPage from "./pages/CartPage";
import AuthPage from "./pages/AuthPage";
import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ThemeToggle from "./components/ThemeToggle";
import { io } from "socket.io-client";

// Admin/user route guards and pages
import AdminRoute from "./components/AdminRoute";
import PrivateRoute from "./components/PrivateRoute";
import AdminDashboard from "./pages/AdminDashboard";
import UserProfile from "./pages/UserProfile";
import MyOrders from "./pages/MyOrders";
import Notifications from "./pages/Notifications";

// Lazy load heavy pages
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const CheckoutPage = lazy(() => import("./pages/NewCheckoutPage"));
const PaymentPage = lazy(() => import("./pages/PaymentPage")); // Payment choice: UPI or COD
const UpiPayment = lazy(() => import("./pages/UpiPayment"));   // NEW: UPI scan + confirm page

// Create a Socket.IO context
export const SocketContext = React.createContext(null);

// Prefer env-based socket/API URL for easy local vs prod switching
const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:5000";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const stored = localStorage.getItem("isLoggedIn");
    return stored === "true";
  });

  useEffect(() => {
    localStorage.setItem("isLoggedIn", isLoggedIn);
  }, [isLoggedIn]);

  // Single socket instance, credentials enabled; auto-closed on unmount
  const socket = useMemo(
    () =>
      io(SOCKET_URL, {
        withCredentials: true,
        transports: ["websocket", "polling"],
      }),
    []
  );

  // Join the user's room for real-time order status updates
  useEffect(() => {
    const joinIfPossible = () => {
      const userId = localStorage.getItem("userId");
      if (userId) socket.emit("join", userId);
    };

    if (socket?.connected) {
      joinIfPossible();
    }
    socket.on("connect", joinIfPossible);

    return () => {
      socket.off("connect", joinIfPossible);
    };
  }, [socket, isLoggedIn]);

  // Listen for order status update globally (you can replace with a toast)
  useEffect(() => {
    if (!socket) return;
    const handleOrderStatusUpdate = (data) => {
      console.log("Order status update:", data);
    };
    socket.on("order status update", handleOrderStatusUpdate);
    return () => socket.off("order status update", handleOrderStatusUpdate);
  }, [socket]);

  // Optional: listen for generic notifications
  useEffect(() => {
    if (!socket) return;
    const onNotif = (n) => console.log("notification:new", n);
    socket.on("notification:new", onNotif);
    return () => socket.off("notification:new", onNotif);
  }, [socket]);

  // Clean up socket on app unmount (dev hot-reload friendly)
  useEffect(() => {
    return () => {
      try {
        socket?.close();
      } catch {}
    };
  }, [socket]);

  return (
    <ThemeProvider>
      <CartProvider>
        <SocketContext.Provider value={socket}>
          <Router>
            <div className="min-h-screen flex flex-col bg-app">
              <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
              <ThemeToggle />
              <div className="flex-1 pt-[90px]">
                <Suspense fallback={<div className="p-6">Loading...</div>}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/featured" element={<FeaturedCollection />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/products/:id" element={<ProductDetailPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route
                      path="/auth"
                      element={<AuthPage setIsLoggedIn={setIsLoggedIn} />}
                    />
                    <Route
                      path="/login"
                      element={<AuthPage setIsLoggedIn={setIsLoggedIn} />}
                    />
                    <Route
                      path="/signup"
                      element={<AuthPage setIsLoggedIn={setIsLoggedIn} />}
                    />
                    <Route path="/checkout" element={<CheckoutPage />} />

                    {/* User protected routes */}
                    <Route element={<PrivateRoute />}>
                      <Route path="/profile" element={<UserProfile />} />
                      <Route path="/orders" element={<MyOrders />} />
                      <Route path="/notifications" element={<Notifications />} />
                      {/* Payment flow */}
                      <Route path="/checkout/payment/:orderId" element={<PaymentPage />} />
                      <Route path="/checkout/payment/upi/:orderId" element={<UpiPayment />} />
                    </Route>

                    {/* Admin-protected route */}
                    <Route element={<AdminRoute />}>
                      <Route path="/admin" element={<AdminDashboard />} />
                    </Route>
                  </Routes>
                </Suspense>
              </div>
              <Footer />
            </div>
          </Router>
        </SocketContext.Provider>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;
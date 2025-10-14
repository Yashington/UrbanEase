import React, { useState, lazy, Suspense, useMemo, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css"; // IMPORTANT: ensure global background + overrides are loaded
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

// Lazy load components
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const CheckoutPage = lazy(() => import("./pages/NewCheckoutPage"));

// Create a Socket.IO context
export const SocketContext = React.createContext(null);

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const stored = localStorage.getItem("isLoggedIn");
    return stored === "true";
  });

  useEffect(() => {
    localStorage.setItem("isLoggedIn", isLoggedIn);
  }, [isLoggedIn]);

  const socket = useMemo(() => io("http://localhost:5000"), []);

  // Join the user's room for real-time order status updates
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId && socket) {
      socket.emit("join", userId);
    }
  }, [socket, isLoggedIn]);

  // Listen for order status update globally
  useEffect(() => {
    if (!socket) return;
    const handleOrderStatusUpdate = (data) => {
      console.log("Order status update:", data);
    };
    socket.on("order status update", handleOrderStatusUpdate);
    return () => socket.off("order status update", handleOrderStatusUpdate);
  }, [socket]);

  return (
    <ThemeProvider>
      <CartProvider>
        {/* Provide socket context to all components */}
        <SocketContext.Provider value={socket}>
          <Router>
            {/* Use a single solid background class for the whole app */}
            <div className="min-h-screen flex flex-col bg-app">
              <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
              <ThemeToggle />
              {/* Keep the top padding to clear the fixed navbar */}
              <div className="flex-1 pt-[90px]">
                <Suspense fallback={<div>Loading...</div>}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/featured" element={<FeaturedCollection />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/products/:id" element={<ProductDetailPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/auth" element={<AuthPage setIsLoggedIn={setIsLoggedIn} />} />
                    <Route path="/login" element={<AuthPage setIsLoggedIn={setIsLoggedIn} />} />
                    <Route path="/signup" element={<AuthPage setIsLoggedIn={setIsLoggedIn} />} />
                    <Route path="/checkout" element={<CheckoutPage />} />

                    {/* User protected routes */}
                    <Route element={<PrivateRoute />}>
                      <Route path="/profile" element={<UserProfile />} />
                      <Route path="/orders" element={<MyOrders />} />
                      <Route path="/notifications" element={<Notifications />} />
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
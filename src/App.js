import React, { useState, lazy, Suspense, useMemo, useEffect, useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import { io } from "socket.io-client"; // import socket.io-client

// Lazy load components
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const CheckoutPage = lazy(() => import("./pages/NewCheckoutPage"));

// Create a Socket.IO context
export const SocketContext = React.createContext(null);

function App() {
  // Persist login state across refreshes (optional)
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const stored = localStorage.getItem("isLoggedIn");
    return stored === "true";
  });

  // Update localStorage when login status changes
  useEffect(() => {
    localStorage.setItem("isLoggedIn", isLoggedIn);
  }, [isLoggedIn]);

  // Memoize socket instance so it's only created once
  const socket = useMemo(() => io("http://localhost:5000"), []);

  // Join the user's room for real-time order status updates
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId && socket) {
      socket.emit("join", userId);
    }
  }, [socket, isLoggedIn]);

  // Listen for order status update globally, show an alert (replace with toast for better UX)
  useEffect(() => {
    if (!socket) return;
    const handleOrderStatusUpdate = (data) => {
      alert(`Order ${data.orderId} status updated: ${data.status}`);
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
            <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#dbeafe] via-[#bfdbfe] to-[#93c5fd]">
              <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
              <ThemeToggle />
              <div className="flex-1 pt-[90px]">
                <Suspense fallback={<div>Loading product details...</div>}>
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
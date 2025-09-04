import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Footer from "./components/Footer";
import FeaturedCollection from "./pages/FeaturedCollection";
import ProductsPage from "./pages/ProductsPage";
import CartPage from "./pages/CartPage";
import AuthPage from "./pages/AuthPage";
import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext"; // <-- Add this import
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ThemeToggle from "./components/ThemeToggle"; // <-- (optional) if you want the toggle button

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <ThemeProvider> {/* <-- Wrap everything in ThemeProvider */}
      <CartProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#dbeafe] via-[#bfdbfe] to-[#93c5fd]">
            <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
            {/* Optional: Theme toggle button for demonstration */}
            <ThemeToggle />
            <div className="flex-1 pt-[90px]">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/featured" element={<FeaturedCollection />} />
                <Route path="/products" element={<ProductsPage />} />
                {isLoggedIn && <Route path="/cart" element={<CartPage />} />}
                {/* Unified Auth Page for signup/login */}
                <Route path="/auth" element={<AuthPage setIsLoggedIn={setIsLoggedIn} />} />
                <Route path="/login" element={<AuthPage setIsLoggedIn={setIsLoggedIn} />} />
                <Route path="/signup" element={<AuthPage setIsLoggedIn={setIsLoggedIn} />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;
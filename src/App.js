import React, { useState, lazy, Suspense } from "react";
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

// Lazy load detail and checkout pages for code splitting
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const NewCheckoutPage = lazy(() => import("./pages/NewCheckoutPage"));

function App() {
  // Start with logged out state by default
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Update localStorage when login status changes
  React.useEffect(() => {
    localStorage.setItem("isLoggedIn", isLoggedIn);
  }, [isLoggedIn]);

  return (
    <ThemeProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
            <ThemeToggle />
            <div className="flex-1 pt-[90px] bg-gradient-to-br from-[#dbeafe] via-[#bfdbfe] to-[#93c5fd]">
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
                  <Route path="/checkout" element={<NewCheckoutPage />} />
                </Routes>
              </Suspense>
            </div>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;
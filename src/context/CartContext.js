import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Load cart from database on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const userId = localStorage.getItem("userId") || "guest";
        const response = await fetch(`http://localhost:5000/api/cart/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setCart(data.items || []);
        }
      } catch (error) {
        console.error("Failed to load cart:", error);
        // Fallback to localStorage
        const saved = localStorage.getItem("cart");
        setCart(saved ? JSON.parse(saved) : []);
      }
    };
    
    loadCart();
  }, []);

  // Save cart to database and localStorage
  const saveCart = async (newCart) => {
    try {
      const userId = localStorage.getItem("userId") || "guest";
      await fetch(`http://localhost:5000/api/cart/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: newCart }),
      });
      localStorage.setItem("cart", JSON.stringify(newCart));
    } catch (error) {
      console.error("Failed to save cart:", error);
      // Fallback to localStorage only
      localStorage.setItem("cart", JSON.stringify(newCart));
    }
  };

  // Add product to cart
  const addToCart = async (product) => {
    const newCart = [...cart];
    const exists = newCart.find((item) => item.id === product.id);
    
    if (exists) {
      exists.quantity = (exists.quantity || 1) + 1;
    } else {
      newCart.push({ ...product, quantity: 1 });
    }
    
    setCart(newCart);
    await saveCart(newCart);
  };

  // Remove product from cart
  const removeFromCart = async (id) => {
    const newCart = cart.filter((item) => item.id !== id);
    setCart(newCart);
    await saveCart(newCart);
  };

  // Update product quantity
  const updateQuantity = async (id, quantity) => {
    const newCart = cart.map((item) =>
      item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
    );
    setCart(newCart);
    await saveCart(newCart);
  };

  // Clear cart
  const clearCart = async () => {
    setCart([]);
    await saveCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
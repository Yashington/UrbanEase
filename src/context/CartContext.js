import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  // FINAL CHANGE: Start with empty cart and don't persist in localStorage
  const [cart, setCart] = useState([]);

  // FINAL CHANGE: Sync cart with database when user is logged in
  const syncCartWithDatabase = async (cartData, action = 'update') => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const response = await fetch("http://localhost:5000/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          action,
          cartData
        }),
      });
      
      if (!response.ok) {
        console.error("Failed to sync cart with database");
      }
    } catch (error) {
      console.error("Error syncing cart:", error);
    }
  };

  // FINAL CHANGE: Load cart from database when user logs in
  const loadCartFromDatabase = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const response = await fetch(`http://localhost:5000/api/cart/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setCart(data.items || []);
      }
    } catch (error) {
      console.error("Error loading cart from database:", error);
    }
  };

  // Load cart from database on component mount if user is logged in
  useEffect(() => {
    loadCartFromDatabase();
  }, []);

  // Add product to cart (increase quantity if exists)
  const addToCart = async (product) => {
    const newCart = [...cart];
    const exists = newCart.find((item) => item.id === product.id);
    
    if (exists) {
      exists.quantity = (exists.quantity || 1) + 1;
    } else {
      newCart.push({ ...product, quantity: 1 });
    }
    
    setCart(newCart);
    await syncCartWithDatabase(newCart, 'update');
  };

  // Remove product from cart
  const removeFromCart = async (id) => {
    const newCart = cart.filter((item) => item.id !== id);
    setCart(newCart);
    await syncCartWithDatabase(newCart, 'remove');
  };

  // Update product quantity
  const updateQuantity = async (id, quantity) => {
    const newCart = cart.map((item) =>
      item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
    );
    setCart(newCart);
    await syncCartWithDatabase(newCart, 'update');
  };

  // Clear cart
  const clearCart = async () => {
    setCart([]);
    await syncCartWithDatabase([], 'clear');
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      loadCartFromDatabase 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
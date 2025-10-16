import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Load cart from MongoDB on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const userId = localStorage.getItem("userId") || "guest";
        const response = await fetch(`https://urbanease-backend.onrender.com/api/cart/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setCart(data.items || []);
        } else {
          setCart([]);
        }
      } catch (error) {
        console.error("Failed to load cart:", error);
        setCart([]);
      }
    };

    loadCart();
  }, []);

  // Save cart to MongoDB
  const saveCart = async (newCart) => {
    try {
      const userId = localStorage.getItem("userId") || "guest";
      await fetch(`https://urbanease-backend.onrender.com/api/cart/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: newCart }),
      });
    } catch (error) {
      console.error("Failed to save cart:", error);
    }
  };

  // Add product to cart and update DB
  const addToCart = async (product) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      alert("Please log in first to add items to your cart.");
      window.location.href = "/auth";
      return;
    }
    const newCart = [...cart];
    const exists = newCart.find((item) => item.productId === product.id || item.id === product.id);
    if (exists) {
      exists.quantity = (exists.quantity || 1) + 1;
    } else {
      newCart.push({
        ...product,
        productId: product.id,
        quantity: 1,
      });
    }
    setCart(newCart);
    await saveCart(newCart);
  };

  // Remove product from cart and update DB
  const removeFromCart = async (id) => {
    const newCart = cart.filter(
      (item) => (item.productId || item.id) !== id
    );
    setCart(newCart);
    await saveCart(newCart);
  };

  // Update product quantity and update DB
  const updateQuantity = async (id, quantity) => {
    const newCart = cart.map((item) =>
      (item.productId || item.id) === id
        ? { ...item, quantity: Math.max(1, quantity) }
        : item
    );
    setCart(newCart);
    await saveCart(newCart);
  };

  // Clear cart in state and MongoDB
  const clearCart = async () => {
    const userId = localStorage.getItem("userId") || "guest";
    setCart([]);
    // Also clear the cart from MongoDB
    await fetch(`https://urbanease-backend.onrender.com/api/cart/${userId}`, {
      method: "DELETE",
    });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
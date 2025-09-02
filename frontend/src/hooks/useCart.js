import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { cartApi } from '../axiosconfig';

const CartContext = createContext(null);

const EMPTY_CART = {
  items: [],
  totalPrice: 0,
  totalCount: 0,
  total: 0,
  subtotal: 0,
  itemCount: 0,
};

// Get or create sessionId for guests
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('cart_session_id');
  if (!sessionId) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 12);
    const userAgent = navigator.userAgent.slice(-20);
    sessionId = `guest-${timestamp}-${random}-${btoa(userAgent).slice(0, 8)}`;
    sessionStorage.setItem('cart_session_id', sessionId);
  }
  return sessionId;
};

// Get userId from localStorage
const getUserId = () => {
  try {
    const userFromStorage = localStorage.getItem('user');
    if (!userFromStorage) return null;
    const user = JSON.parse(userFromStorage);
    return user?.id || user?._id || null;
  } catch {
    return null;
  }
};

// Compose headers for every request dynamically
const getHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  const userId = getUserId();
  const sessionId = getSessionId();
  headers['x-session-id'] = sessionId;
  if (userId) {
    headers['x-user-id'] = userId;
  }
  return headers;
};

const calculateCartTotals = (items) => {
  const totalPrice = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const totalCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  return {
    items,
    totalPrice,
    totalCount,
    itemCount: totalCount,
    total: totalPrice,
    subtotal: totalPrice,
  };
};

const cartAPI = {
  async getCart() {
    const response = await cartApi.get('/', { headers: getHeaders() });
    return response.data;
  },

  async addToCart(productData) {
    const response = await cartApi.post('/add', productData, { headers: getHeaders() });
    return response.data;
  },

  async updateQuantity(productId, quantity) {
    const response = await cartApi.put(`/update/${productId}`, { quantity }, { headers: getHeaders() });
    return response.data;
  },

  async removeFromCart(productId) {
    const response = await cartApi.delete(`/remove/${productId}`, { headers: getHeaders() });
    return response.data;
  },

  async clearCart() {
    const response = await cartApi.delete('/clear', { headers: getHeaders() });
    return response.data;
  },
};

export function CartProvider({ children }) {
  const [cart, setCart] = useState(EMPTY_CART);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadInitialCart() {
      setLoading(true);
      try {
        const cartData = await cartAPI.getCart();
        setCart(cartData || EMPTY_CART);
      } catch (err) {
        setCart(EMPTY_CART);
        setError('Failed to load cart');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialCart();
  }, []);

  const addToCart = useCallback(async (food) => {
    setError(null);

    // Optimistic update locally
    const existingIndex = cart.items.findIndex(i => i.productId === (food.id || food._id));
    let newItems = [...cart.items];

    if (existingIndex !== -1) {
      newItems[existingIndex] = {
        ...newItems[existingIndex],
        quantity: (newItems[existingIndex].quantity || 1) + 1,
      };
    } else {
      newItems.push({ ...food, quantity: 1, productId: food.id || food._id });
    }
    setCart(calculateCartTotals(newItems));

    try {
      await cartAPI.addToCart({
        productId: food.id || food._id,
        productName: food.name,
        price: food.price,
        quantity: 1,
        productImage: food.imageUrl || food.image,
        ...(food.customDesignId && { customDesignId: food.customDesignId }),
      });
    } catch (err) {
      setError('Failed to add item to cart');
      console.error(err);
      // Optionally refresh cart from server here
    }
  }, [cart]);

  const removeFromCart = useCallback(async (productId) => {
    setError(null);
    const newItems = cart.items.filter(item => item.productId !== productId);
    setCart(calculateCartTotals(newItems));
    try {
      await cartAPI.removeFromCart(productId);
    } catch (err) {
      setError('Failed to remove item from cart');
      console.error(err);
      // Optionally rollback or refresh cart
    }
  }, [cart]);

  const changeQuantity = useCallback(async (cartItem, newQuantity) => {
    setError(null);

    if (newQuantity < 1) {
      const filteredItems = cart.items.filter(item => item.productId !== cartItem.productId);
      setCart(calculateCartTotals(filteredItems));
      try {
        await cartAPI.removeFromCart(cartItem.productId);
      } catch (err) {
        setError('Failed to remove item');
        console.error(err);
      }
      return;
    }

    const newItems = cart.items.map(item =>
      item.productId === cartItem.productId ? { ...item, quantity: newQuantity } : item
    );
    setCart(calculateCartTotals(newItems));

    try {
      await cartAPI.updateQuantity(cartItem.productId, newQuantity);
    } catch (err) {
      setError('Failed to update quantity');
      console.error(err);
    }
  }, [cart]);

  const clearCart = useCallback(async () => {
    setError(null);
    setCart(EMPTY_CART);
    try {
      await cartAPI.clearCart();
    } catch (err) {
      setError('Failed to clear cart');
      console.error(err);
    }
  }, []);

  return (
    <CartContext.Provider value={{ cart, loading, error, addToCart, removeFromCart, changeQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}

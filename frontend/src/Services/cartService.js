const CART_SERVICE_URL = process.env.REACT_APP_CART_SERVICE_URL || 'http://localhost:3003';

// Generate or get session ID for guest users
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('cart_session_id');
  if (!sessionId) {
    sessionId = 'guest-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('cart_session_id', sessionId);
  }
  return sessionId;
};

// Get user ID if logged in
const getUserId = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user?.id || null;
};

// Common headers for all requests
const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
    'x-session-id': getSessionId()
  };

  const userId = getUserId();
  if (userId) {
    headers['x-user-id'] = userId;
  }

  return headers;
};

export const cartService = {
  // Get current cart - handles both user and session-based carts
  async getCart() {
    try {
      const userId = getUserId();
      const sessionId = getSessionId();
      
      // Build query parameters
      const params = new URLSearchParams();
      if (userId) {
        params.append('userId', userId);
      }
      params.append('sessionId', sessionId);

      const response = await fetch(`${CART_SERVICE_URL}/api/cart?${params.toString()}`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const cartData = await response.json();
      
      // If user just logged in and has both session and user carts, 
      // the backend should handle merging and return the merged cart
      return cartData;
    } catch (error) {
      console.error('Error fetching cart:', error);
      return { items: [], total: 0, subtotal: 0 };
    }
  },
  
  // Add item to cart
  async addToCart(food) {
    try {
      const response = await fetch(`${CART_SERVICE_URL}/api/cart/add`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          productId: food._id || food.id,
          quantity: 1,
          price: food.price,
          productName: food.name,
          productImage: food.imageUrl
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  // Update item quantity
  async updateQuantity(productId, quantity) {
    try {
      const response = await fetch(`${CART_SERVICE_URL}/api/cart/update/${productId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ quantity })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  },

  // Remove item from cart
  async removeFromCart(productId) {
    try {
      const response = await fetch(`${CART_SERVICE_URL}/api/cart/remove/${productId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },

  // Clear cart
  async clearCart() {
    try {
      const response = await fetch(`${CART_SERVICE_URL}/api/cart/clear`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },

  // Get cart summary (item count, total)
  async getCartSummary() {
    try {
      const response = await fetch(`${CART_SERVICE_URL}/api/cart/summary`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching cart summary:', error);
      return { itemCount: 0, total: 0 };
    }
  },

  // Merge guest cart with user cart (call this on login)
  async mergeCart() {
    try {
      const response = await fetch(`${CART_SERVICE_URL}/api/cart/merge`, {
        method: 'POST',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error merging cart:', error);
      throw error;
    }
  },

  // Refresh cart after login - merges guest cart and returns updated cart
  async refreshAfterLogin() {
    try {
      // Small delay to ensure localStorage is updated with user data
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Try to merge guest cart with user cart first
      try {
        await this.mergeCart();
      } catch (mergeError) {
        console.warn('Cart merge failed, continuing with regular refresh:', mergeError);
      }
      
      // Get the fresh cart data (now with user context)
      const cartData = await this.getCart();
      
      console.log('Cart refreshed after login:', cartData);
      return cartData;
    } catch (error) {
      console.error('Error refreshing cart after login:', error);
      return { items: [], total: 0, subtotal: 0 };
    }
  },

  // Refresh cart after logout - clears user context and gets session cart
  async refreshAfterLogout() {
    try {
      // Small delay to ensure localStorage is cleared
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Get cart data (now without user context, will fall back to session)
      const cartData = await this.getCart();
      
      console.log('Cart refreshed after logout:', cartData);
      return cartData;
    } catch (error) {
      console.error('Error refreshing cart after logout:', error);
      return { items: [], total: 0, subtotal: 0 };
    }
  },

  // Initialize cart refresh listeners (call this once in your app)
  initializeAuthListeners(onCartUpdate = null) {
    // Store callback for direct UI updates
    this.onCartUpdate = onCartUpdate;

    // Listen for custom login/logout events
    window.addEventListener('userLogin', async () => {
      try {
        const updatedCart = await this.refreshAfterLogin();
        // Dispatch cart updated event for components to listen
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: updatedCart }));
        // Call direct callback if provided
        if (this.onCartUpdate) {
          this.onCartUpdate(updatedCart);
        }
      } catch (error) {
        console.error('Failed to refresh cart after login:', error);
      }
    });

    window.addEventListener('userLogout', async () => {
      try {
        const updatedCart = await this.refreshAfterLogout();
        // Dispatch cart updated event for components to listen
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: updatedCart }));
        // Call direct callback if provided
        if (this.onCartUpdate) {
          this.onCartUpdate(updatedCart);
        }
      } catch (error) {
        console.error('Failed to refresh cart after logout:', error);
      }
    });

    // Listen for localStorage changes (alternative approach)
    window.addEventListener('storage', async (e) => {
      if (e.key === 'user') {
        let updatedCart;
        if (e.newValue && e.newValue !== 'null') {
          // User logged in
          updatedCart = await this.refreshAfterLogin();
        } else {
          // User logged out
          updatedCart = await this.refreshAfterLogout();
        }
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: updatedCart }));
        if (this.onCartUpdate) {
          this.onCartUpdate(updatedCart);
        }
      }
    });

    console.log('Cart auth listeners initialized');
  },

  // Direct method to call after login (returns updated cart data)
  async handleUserLogin() {
    try {
      const updatedCart = await this.refreshAfterLogin();
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: updatedCart }));
      return updatedCart;
    } catch (error) {
      console.error('Failed to handle user login:', error);
      return { items: [], total: 0, subtotal: 0 };
    }
  },

  // Direct method to call after logout (returns updated cart data)
  async handleUserLogout() {
    try {
      const updatedCart = await this.refreshAfterLogout();
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: updatedCart }));
      return updatedCart;
    } catch (error) {
      console.error('Failed to handle user logout:', error);
      return { items: [], total: 0, subtotal: 0 };
    }
  }
};
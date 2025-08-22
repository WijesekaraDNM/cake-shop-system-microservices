const cartService = require('../services/cartService');

const cartController = {
  async getCart(req, res) {
    try {
      const userId = req.headers['x-user-id'] || null;
      const sessionId = req.headers['x-session-id'] || null;
      
      console.log('getCart - userId:', userId, 'sessionId:', sessionId);
      
      if (!userId && !sessionId) {
        return res.status(400).json({ error: 'User ID or Session ID is required' });
      }
      
      const cart = await cartService.getCart(userId, sessionId);
      console.log('getCart - cart returned:', cart);
      res.json(cart);
    } catch (error) {
      console.error('Error in getCart controller:', error);
      res.status(500).json({ error: 'Failed to get cart' });
    }
  },

  async addToCart(req, res) {
    try {
      const userId = req.headers['x-user-id'] || null;
      const sessionId = req.headers['x-session-id'] || null;
      
      console.log('addToCart - userId:', userId, 'sessionId:', sessionId);
      console.log('addToCart - req.body:', JSON.stringify(req.body, null, 2));
      
      if (!userId && !sessionId) {
        console.log('addToCart - Missing userId and sessionId');
        return res.status(400).json({ error: 'User ID or Session ID is required' });
      }
      
      const productData = req.body;
      
      // Validate required fields
      if (!productData.productName || productData.price === undefined || productData.price === null) {
        console.log('addToCart - Missing required fields:', {
          productName: productData.productName,
          price: productData.price
        });
        return res.status(400).json({ 
          error: 'Product name and price are required' 
        });
      }
      
      if (!productData.productId && !productData.customDesignId) {
        console.log('addToCart - Missing productId and customDesignId');
        return res.status(400).json({ 
          error: 'Either productId or customDesignId is required' 
        });
      }
      
      console.log('addToCart - About to call cartService.addToCart with:', {
        userId,
        sessionId,
        productData
      });
      
      const result = await cartService.addToCart(userId, sessionId, productData);
      console.log('addToCart - cartService result:', result);
      res.json(result);
    } catch (error) {
      console.error('Error in addToCart controller:', error);
      console.error('Stack trace:', error.stack);
      res.status(500).json({ error: 'Failed to add item to cart', details: error.message });
    }
  },

  async updateQuantity(req, res) {
    try {
      const userId = req.headers['x-user-id'] || null;
      const sessionId = req.headers['x-session-id'] || null;
      const { productId } = req.params;
      const { quantity } = req.body;
      
      console.log('updateQuantity - userId:', userId, 'sessionId:', sessionId, 'productId:', productId, 'quantity:', quantity);
      
      if (!userId && !sessionId) {
        return res.status(400).json({ error: 'User ID or Session ID is required' });
      }
      
      const result = await cartService.updateQuantity(userId, sessionId, productId, quantity);
      res.json(result);
    } catch (error) {
      console.error('Error in updateQuantity controller:', error);
      res.status(500).json({ error: 'Failed to update quantity' });
    }
  },

  async removeFromCart(req, res) {
    try {
      const userId = req.headers['x-user-id'] || null;
      const sessionId = req.headers['x-session-id'] || null;
      const { productId } = req.params;
      
      console.log('removeFromCart - userId:', userId, 'sessionId:', sessionId, 'productId:', productId);
      
      if (!userId && !sessionId) {
        return res.status(400).json({ error: 'User ID or Session ID is required' });
      }
      
      const result = await cartService.removeFromCart(userId, sessionId, productId);
      res.json(result);
    } catch (error) {
      console.error('Error in removeFromCart controller:', error);
      res.status(500).json({ error: 'Failed to remove item from cart' });
    }
  },

  async clearCart(req, res) {
    try {
      const userId = req.headers['x-user-id'] || null;
      const sessionId = req.headers['x-session-id'] || null;
      
      if (!userId && !sessionId) {
        return res.status(400).json({ error: 'User ID or Session ID is required' });
      }
      
      const result = await cartService.clearCart(userId, sessionId);
      res.json(result);
    } catch (error) {
      console.error('Error in clearCart controller:', error);
      res.status(500).json({ error: 'Failed to clear cart' });
    }
  },

  async getCartSummary(req, res) {
    try {
      const userId = req.headers['x-user-id'] || null;
      const sessionId = req.headers['x-session-id'] || null;
      
      if (!userId && !sessionId) {
        return res.json({ itemCount: 0, total: 0 });
      }
      
      const summary = await cartService.getCartSummary(userId, sessionId);
      res.json(summary);
    } catch (error) {
      console.error('Error in getCartSummary controller:', error);
      res.json({ itemCount: 0, total: 0 });
    }
  },

  async mergeCart(req, res) {
    try {
      const userId = req.headers['x-user-id'];
      const sessionId = req.headers['x-session-id'];
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required for merging cart' });
      }
      
      if (!sessionId) {
        return res.json({ success: true, message: 'No session cart to merge' });
      }
      
      const result = await cartService.mergeCart(userId, sessionId);
      res.json(result);
    } catch (error) {
      console.error('Error in mergeCart controller:', error);
      res.status(500).json({ error: 'Failed to merge cart' });
    }
  }
};

module.exports = cartController;
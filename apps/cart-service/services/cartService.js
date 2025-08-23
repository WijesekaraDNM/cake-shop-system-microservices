const CartModel = require('../models/Cart');

const cartService = {
  // Get cart by userId or sessionId
  async getCart(userId, sessionId) {
    try {
      console.log('cartService.getCart - userId:', userId, 'sessionId:', sessionId);
      let cart;
      
      if (userId) {
        console.log('cartService.getCart - Finding cart by userId');
        cart = await CartModel.findOne({ userId });
      } else if (sessionId) {
        console.log('cartService.getCart - Finding cart by sessionId');
        cart = await CartModel.findOne({ sessionId });
      }
      
      console.log('cartService.getCart - Raw cart from DB:', JSON.stringify(cart, null, 2));
      
      if (!cart || !cart.items || cart.items.length === 0) {
        console.log('cartService.getCart - No cart or items found, returning empty cart');
        return { 
          items: [], 
          total: 0, 
          totalPrice: 0,
          subtotal: 0, 
          totalCount: 0,
          itemCount: 0 
        };
      }
      
      // Transform items to match frontend expectations
      const transformedItems = cart.items.map((item, index) => {
        console.log(`cartService.getCart - Transforming item ${index}:`, JSON.stringify(item, null, 2));
        
        // Get the correct ID - try different sources
        let itemId = null;
        if (item.productId) {
          itemId = typeof item.productId === 'object' ? item.productId._id || item.productId.toString() : item.productId.toString();
        } else if (item.customDesignId) {
          itemId = typeof item.customDesignId === 'object' ? item.customDesignId._id || item.customDesignId.toString() : item.customDesignId.toString();
        } else {
          itemId = item._id ? item._id.toString() : `temp_${index}`;
        }
        
        const baseItem = {
          // Main item properties
          id: itemId,
          _id: itemId,
          name: item.name,
          price: Number(item.price),
          quantity: Number(item.quantity || 1),
          imageUrl: item.imageUrl,
          
          // Keep original structure for compatibility
          productId: item.productId,
          customDesignId: item.customDesignId
        };

        // Add nested food object that frontend expects
        baseItem.food = {
          id: itemId,
          _id: itemId,
          name: item.name,
          price: Number(item.price),
          imageUrl: item.imageUrl
        };

        console.log(`cartService.getCart - Transformed item ${index}:`, JSON.stringify(baseItem, null, 2));
        return baseItem;
      });
      
      const subtotal = cart.items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity || 1)), 0);
      const total = subtotal;
      const itemCount = cart.items.reduce((sum, item) => sum + Number(item.quantity || 1), 0);
      
      const result = {
        items: transformedItems,
        subtotal: Number(subtotal.toFixed(2)),
        total: Number(total.toFixed(2)),
        totalPrice: Number(total.toFixed(2)),
        totalCount: itemCount,
        itemCount: itemCount
      };
      
      console.log('cartService.getCart - Final result:', JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error('Error getting cart:', error);
      console.error('Stack trace:', error.stack);
      throw error;
    }
  },

  // Add item to cart
  async addToCart(userId, sessionId, productData) {
    try {
      console.log('cartService.addToCart - userId:', userId, 'sessionId:', sessionId);
      console.log('cartService.addToCart - productData:', JSON.stringify(productData, null, 2));
      
      const { productId, customDesignId, quantity = 1, price, productName: name, productImage: imageUrl } = productData;
      
      console.log('cartService.addToCart - Extracted data:', {
        productId,
        customDesignId,
        quantity,
        price,
        name,
        imageUrl
      });
      
      // Find existing cart or create new one
      let cart;
      const query = userId ? { userId } : { sessionId };
      
      console.log('cartService.addToCart - Finding cart with query:', query);
      cart = await CartModel.findOne(query);
      console.log('cartService.addToCart - Found existing cart:', !!cart);
      
      if (!cart) {
        console.log('cartService.addToCart - Creating new cart');
        cart = new CartModel({
          ...(userId ? { userId } : { sessionId }),
          items: []
        });
      }
      
      // Check if item already exists in cart
      const existingItemIndex = cart.items.findIndex(item => {
        if (productId) {
          return item.productId && item.productId.toString() === productId;
        } else if (customDesignId) {
          return item.customDesignId && item.customDesignId.toString() === customDesignId;
        }
        return false;
      });
      
      console.log('cartService.addToCart - Existing item index:', existingItemIndex);
      
      if (existingItemIndex > -1) {
        // Update quantity if item exists
        console.log('cartService.addToCart - Updating existing item quantity');
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        console.log('cartService.addToCart - Adding new item to cart');
        const newItem = {
          ...(productId && { productId }),
          ...(customDesignId && { customDesignId }),
          name,
          price: Number(price), // Ensure price is a number
          quantity: Number(quantity), // Ensure quantity is a number
          imageUrl
        };
        console.log('cartService.addToCart - New item to add:', newItem);
        cart.items.push(newItem);
      }
      
      console.log('cartService.addToCart - About to save cart with items:', cart.items.length);
      const savedCart = await cart.save();
      console.log('cartService.addToCart - Cart saved successfully');
      
      return { success: true, message: 'Item added to cart successfully' };
    } catch (error) {
      console.error('Error adding to cart:', error);
      console.error('Stack trace:', error.stack);
      throw error;
    }
  },

  // Update item quantity
  async updateQuantity(userId, sessionId, productId, quantity) {
    try {
      console.log('cartService.updateQuantity - userId:', userId, 'sessionId:', sessionId, 'productId:', productId, 'quantity:', quantity);
      
      const query = userId ? { userId } : { sessionId };
      const cart = await CartModel.findOne(query);
      
      if (!cart) {
        throw new Error('Cart not found');
      }
      
      // Find item by productId or customDesignId
      const itemIndex = cart.items.findIndex(item => {
        if (item.productId) {
          return item.productId.toString() === productId;
        }
        if (item.customDesignId) {
          return item.customDesignId.toString() === productId;
        }
        return false;
      });
      
      if (itemIndex === -1) {
        throw new Error('Item not found in cart');
      }
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }
      
      await cart.save();
      
      return { success: true, message: 'Cart updated successfully' };
    } catch (error) {
      console.error('Error updating cart:', error);
      throw error;
    }
  },

  // Remove item from cart
  async removeFromCart(userId, sessionId, productId) {
    try {
      console.log('cartService.removeFromCart - userId:', userId, 'sessionId:', sessionId, 'productId:', productId);
      
      const query = userId ? { userId } : { sessionId };
      const cart = await CartModel.findOne(query);
      
      if (!cart) {
        throw new Error('Cart not found');
      }
      
      cart.items = cart.items.filter(item => {
        if (item.productId) {
          return item.productId.toString() !== productId;
        }
        if (item.customDesignId) {
          return item.customDesignId.toString() !== productId;
        }
        return true;
      });
      
      await cart.save();
      
      return { success: true, message: 'Item removed from cart' };
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },

  // Clear entire cart
  async clearCart(userId, sessionId) {
    try {
      const query = userId ? { userId } : { sessionId };
      const cart = await CartModel.findOne(query);
      
      if (cart) {
        cart.items = [];
        await cart.save();
      }
      
      return { success: true, message: 'Cart cleared successfully' };
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },

  // Get cart summary (for navbar badge)
  async getCartSummary(userId, sessionId) {
    try {
      const cart = await this.getCart(userId, sessionId);
      return {
        itemCount: cart.itemCount || 0,
        total: cart.total || 0
      };
    } catch (error) {
      console.error('Error getting cart summary:', error);
      return { itemCount: 0, total: 0 };
    }
  },

  // Merge guest cart with user cart (on login)
  async mergeCart(userId, sessionId) {
    try {
      const guestCart = await CartModel.findOne({ sessionId });
      
      if (!guestCart || guestCart.items.length === 0) {
        return { success: true, message: 'No guest cart to merge' };
      }
      
      let userCart = await CartModel.findOne({ userId });
      
      if (!userCart) {
        // Convert guest cart to user cart
        guestCart.userId = userId;
        guestCart.sessionId = undefined;
        await guestCart.save();
      } else {
        // Merge items from guest cart to user cart
        for (const guestItem of guestCart.items) {
          const existingItemIndex = userCart.items.findIndex(item => {
            if (guestItem.productId) {
              return item.productId && item.productId.toString() === guestItem.productId.toString();
            } else if (guestItem.customDesignId) {
              return item.customDesignId && item.customDesignId.toString() === guestItem.customDesignId.toString();
            }
            return false;
          });
          
          if (existingItemIndex > -1) {
            userCart.items[existingItemIndex].quantity += guestItem.quantity;
          } else {
            userCart.items.push(guestItem);
          }
        }
        
        await userCart.save();
        await CartModel.deleteOne({ sessionId }); // Remove guest cart
      }
      
      return { success: true, message: 'Cart merged successfully' };
    } catch (error) {
      console.error('Error merging cart:', error);
      throw error;
    }
  }
};

module.exports = cartService;
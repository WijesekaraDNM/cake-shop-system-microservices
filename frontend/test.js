import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';
import { BsCartCheck, BsCartX } from 'react-icons/bs';
import Price from '../../Components/price/Price';
import Title from '../../Components/Title/Title';
import classes from './cart.module.css';

export default function Cart() {
  const { cart, removeFromCart, changeQuantity } = useCart();

  // Debug: Log the cart structure
  console.log('Full cart object:', cart);
  console.log('Cart items:', cart?.items);
  if (cart?.items?.length > 0) {
    console.log('First cart item structure:', cart.items[0]);
  }

  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity < 1) {
      // Handle different possible structures
      const itemId = getItemId(item);
      if (itemId) {
        removeFromCart(itemId);
      }
    } else {
      changeQuantity(item, newQuantity);
    }
  };

  // Function to safely get image URL
  const getImageUrl = (item) => {
    // Try different possible paths for the image
    const possiblePaths = [
      item?.imageUrl,
      item?.food?.imageUrl,
      item?.food?.image,
      item?.image
    ];
    
    for (const path of possiblePaths) {
      if (path) {
        console.log('Using image path:', path);
        return path;
      }
    }
    
    console.log('No image found for item:', item);
    return '/placeholder-cake.jpg'; // Fallback
  };

  // Function to safely get item name
  const getItemName = (item) => {
    return item?.name || item?.food?.name || 'Unknown Item';
  };

  // Function to safely get item ID
  const getItemId = (item) => {
    // Try multiple sources for ID
    return item?.id || 
           item?._id || 
           item?.productId?._id || 
           item?.productId || 
           item?.customDesignId?._id || 
           item?.customDesignId || 
           item?.food?.id || 
           item?.food?._id || 
           Math.random().toString();
  };

  // Function to safely get item price
  const getItemPrice = (item) => {
    return item?.price || item?.food?.price || 0;
  };

  // Function to get total for item (price * quantity)
  const getItemTotal = (item) => {
    const price = getItemPrice(item);
    const quantity = item?.quantity || 1;
    return price * quantity;
  };

  return (
    <div className={classes.cartPage}>
      <Title 
        title="Your Shopping Cart" 
        margin="2rem 0 1rem 0" 
        fontSize="2.5rem" 
        color="#5c2a2a"
        display="flex"
        justifyContent="center"
        alignItems="center"
      />

      {!cart || !cart.items || cart.items.length === 0 ? (
        <div className={classes.emptyCart}>
          <BsCartX size={64} color="#c7215d" />
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any cakes yet</p>
          <Link to="/designsPage" className={classes.shopButton}>
            Browse Cakes
          </Link>
        </div>
      ) : (
        <div className={classes.cartContainer}>
          <div className={classes.cartItems}>
            {cart.items
              .filter(item => item) // Filter out null/undefined items
              .map((item, index) => {
                // Debug each item
                console.log(`Cart item ${index}:`, item);
                
                const itemId = getItemId(item);
                const imageUrl = getImageUrl(item);
                const itemName = getItemName(item);
                const itemPrice = getItemPrice(item);
                const itemTotal = getItemTotal(item);
                
                return (
                  <div key={itemId} className={classes.cartItem}>
                    <div className={classes.itemImage}>
                      <img 
                        src={imageUrl}
                        alt={itemName} 
                        loading="lazy"
                        onError={(e) => {
                          console.log('Image failed to load:', e.target.src);
                          e.target.src = '/placeholder-cake.jpg';
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully:', imageUrl);
                        }}
                      />
                    </div>
                    
                    <div className={classes.itemDetails}>
                      <Link 
                        to={`/food/${itemId}`} 
                        className={classes.itemName}
                      >
                        {itemName}
                      </Link>
                      
                      <div className={classes.priceInfo}>
                        <Price price={itemPrice} className={classes.unitPrice} />
                        {(item.quantity || 1) > 1 && (
                          <span className={classes.priceBreakdown}>
                            ({item.quantity || 1} × <Price price={itemPrice} />)
                          </span>
                        )}
                      </div>
                      
                      <div className={classes.quantityControl}>
                        <button 
                          onClick={() => handleQuantityChange(item, (item.quantity || 1) - 1)}
                          aria-label="Decrease quantity"
                        >
                          <FiMinus />
                        </button>
                        <span>{item.quantity || 1}</span>
                        <button 
                          onClick={() => handleQuantityChange(item, (item.quantity || 1) + 1)}
                          aria-label="Increase quantity"
                        >
                          <FiPlus />
                        </button>
                      </div>
                    </div>
                    
                    <div className={classes.priceSection}>
                      <Price price={itemTotal} className={classes.itemPrice} />
                      <button 
                        onClick={() => removeFromCart(itemId)}
                        className={classes.removeButton}
                        aria-label="Remove item"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>

          <div className={classes.cartSummary}>
            <div className={classes.summaryCard}>
              <h3>Order Summary</h3>
              
              <div className={classes.summaryRow}>
                <span>Items ({cart.totalCount || cart.itemCount || cart.items.length || 0})</span>
                <Price price={cart.totalPrice || cart.total || cart.subtotal || 0} />
              </div>
              
              <div className={classes.summaryRow}>
                <span>Delivery</span>
                <span>FREE</span>
              </div>
              
              <div className={classes.summaryTotal}>
                <span>Total</span>
                <Price price={cart.totalPrice || cart.total || cart.subtotal || 0} className={classes.totalPrice} />
              </div>
              
              <Link to="/checkout" className={classes.checkoutButton}>
                <BsCartCheck size={20} />
                Proceed to Checkout
              </Link>
              
              <Link to="/designsPage" className={classes.continueShopping}>
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
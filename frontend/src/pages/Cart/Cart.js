import React, { memo, useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';
import { BsCartCheck, BsCartX } from 'react-icons/bs';
import Price from '../../Components/price/Price';
import Title from '../../Components/Title/Title';
import classes from './cart.module.css';
import { createOrders } from '../../Services/orderService';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

const CartItem = memo(({ item, onQuantityChange, onRemove }) => {
  const itemId = item.id || item._id || item.productId || Math.random().toString();

  const handleDecrease = () => onQuantityChange(item, (item.quantity || 1) - 1);
  const handleIncrease = () => onQuantityChange(item, (item.quantity || 1) + 1);

  return (
    <div key={itemId} className={classes.cartItem}>
      <div className={classes.itemImage}>
        <img src={item.imageUrl || item.food?.imageUrl || '/placeholder-cake.jpg'} alt={item.name || item.food?.name || 'Product'} loading="lazy" onError={e => (e.target.src = '/placeholder-cake.jpg')} />
      </div>
      <div className={classes.itemDetails}>
        <Link to={`/food/${itemId}`} className={classes.itemName}>{item.name || item.food?.name || 'Unknown Item'}</Link>
        <div className={classes.priceInfo}>
          <Price price={item.price || item.food?.price || 0} />
          {(item.quantity || 1) > 1 && (
            <span className={classes.priceBreakdown}>
              ({item.quantity} × <Price price={item.price || item.food?.price || 0} />)
            </span>
          )}
        </div>
        <div className={classes.quantityControl}>
          <button onClick={handleDecrease} aria-label="Decrease quantity"><FiMinus /></button>
          <span>{item.quantity || 1}</span>
          <button onClick={handleIncrease} aria-label="Increase quantity"><FiPlus /></button>
        </div>
      </div>
      <div className={classes.priceSection}>
        <Price price={(item.price || item.food?.price || 0) * (item.quantity || 1)} className={classes.itemPrice} />
        <button onClick={() => onRemove(itemId)} className={classes.removeButton} aria-label="Remove item"><FiTrash2 /></button>
      </div>
    </div>
  );
});

export default function Cart() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { cart, removeFromCart, changeQuantity, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleQuantityChange = useCallback((item, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(item.productId);
    } else {
      changeQuantity(item, newQuantity);
    }
  }, [removeFromCart, changeQuantity]);

  const handleOrder = async () => {
    if (!user?.id || !user.id.trim()) {
      setError('Login is required');
      toast.info('Login is required');
      navigate('/login');
      return;
    }

    if (!cart?.items?.length) {
      setError('Please add at least one item');
      toast.info('Please add at least one item');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const apiItems = cart.items.map(item => ({
        name: item.name,
        price: item.price,
        itemId: item.id,
        quantity: item.quantity,
        imageUrl: item.imageUrl
      }));

      const result = await createOrders(user.id, user.name, user.email, apiItems, parseFloat(cart.totalPrice.toFixed(2)), user.token);
      toast.success("Order created successfully!")
      navigate('/order-details', { state: { order: result } });
      await clearCart();
    } catch (err) {
      setError(err.message || 'Failed to create order');
      toast.error(err.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.cartPage}>
      <Title title="Your Shopping Cart" margin="2rem 0 1rem 0" fontSize="2.5rem" color="#5c2a2a" display="flex" justifyContent="center" alignItems="center" />

      {!cart?.items?.length ? (
        <div className={classes.emptyCart}>
          <BsCartX size={64} color="#c7215d" />
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any cakes yet</p>
          <Link to="/designsPage" className={classes.shopButton}>Browse Cakes</Link>
        </div>
      ) : (
        <div className={classes.cartContainer}>
          <div className={classes.cartItems}>
            {cart.items.map(item => (
              <CartItem key={item.productId || item.id || Math.random()} item={item} onQuantityChange={handleQuantityChange} onRemove={removeFromCart} />
            ))}
          </div>

          <div className={classes.cartSummary}>
            <div className={classes.summaryCard}>
              <h3>Order Summary</h3>
              <div className={classes.summaryRow}>
                <span>Items ({cart.totalCount || cart.itemCount || cart.items.length})</span>
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
              <div className={classes.checkoutButton} onClick={handleOrder} style={{ cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
                <BsCartCheck size={20} />
                {loading ? 'Processing...' : 'Proceed to Order'}
              </div>
              <Link to="/designsPage" className={classes.continueShopping}>Continue Shopping</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

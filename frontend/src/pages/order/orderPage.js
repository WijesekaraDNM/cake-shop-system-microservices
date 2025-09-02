import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Price from '../../Components/price/Price';
import Title from '../../Components/Title/Title';
import classes from './order.module.css';

export default function OrderDetailsPage() {
  const navigate = useNavigate();
  // Get order from location state
  const location = useLocation()
  const { order } = location.state || {};
  console.log("Order: ", order)

  if (!order) {
    return <p className={classes.noOrder}>Order details not available</p>;
  }

  const {
    id,
    customerId,
    status,
    createdAt,
    updatedAt,
    total,
    items = []
  } = order;

  const handleProceedToCheckout = () => {
    navigate('/checkout', { state: { orderId: id } });
  };

  return (
    <div className={classes.container}>
      <Title
        title={`Order Details - #${id}`}
        margin="2rem 0"
        fontSize="2rem"
        color="#5c2a2a"
      />

      <div className={classes.details}>
        <section className={classes.customerSection}>
          <h3>Customer Information</h3>
          <p><strong>Name:</strong> {customerId}</p>
          <p><strong>Status:</strong> {status}</p>
          <p><strong>Order Date:</strong> {new Date(createdAt).toLocaleDateString()}</p>
          <p><strong>Last Response Date:</strong> {new Date(updatedAt).toLocaleDateString()}</p>
          <p><strong>Contact:</strong> {'N/A'}</p>
          <p><strong>Delivery Address:</strong> {'N/A'}</p>
        </section>

        <section className={classes.itemsSection}>
          <h3>Order Items</h3>
          <ul className={classes.itemsList}>
            {items.map(item => (
              <li key={item.id || item.productId || item.itemId} className={classes.item}>
                <img
                  src={item.imageUrl || item.productImage || '/placeholder-cake.jpg'}
                  alt={item.productName || item.name}
                  className={classes.itemImage}
                />
                <div className={classes.itemInfo}>
                  <span className={classes.itemName}>{item.productName || item.name}</span>
                  <span>Quantity: {item.quantity}</span>
                  <span>Price: <Price price={item.price} /></span>
                  <span>Total: <Price price={item.price * item.quantity} /></span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className={classes.summarySection}>
          <h3>Order Summary</h3>
          <div className={classes.summaryRow}>
            <span>Total Amount:</span>
            <Price price={total} className={classes.totalPrice} />
          </div>
          <button className={classes.checkoutButton} onClick={handleProceedToCheckout}>
            Proceed to Checkout
          </button>
        </section>
      </div>
    </div>
  );
}

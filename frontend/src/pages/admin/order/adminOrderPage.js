import React, { useState, useEffect } from 'react';
import classes from './order.module.css'; // you define styles here
import { BsFilterLeft } from 'react-icons/bs';
import Price from '../../../Components/price/Price.js';
import Title from '../../../Components/Title/Title.js';

// Order statuses and display labels (use your exact labels)
const orderStatuses = [
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready for Pickup / Out for Delivery' },
  { key: 'delivered', label: 'Delivered / Picked Up' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function OrdersPage() {
  const [filter, setFilter] = useState('pending');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Filtered orders based on selected status
  const filteredOrders = ((orders || []).filter(order => order.status === filter));

  // Handle clicking on an order to show details
  const handleOrderClick = (order) => setSelectedOrder(order);

  return (
    <div className={classes.container}>
      <Title
        title="Order Management"
        margin="2rem 0"
        fontSize="2.5rem"
        color="#5c2a2a"
        display="flex"
        justifyContent="center"
        alignItems="center"
      />

      {/* Filter buttons */}
      <div className={classes.filters}>
        <BsFilterLeft size={24} color="#5c2a2a" />
        {orderStatuses.map(({ key, label }) => (
          <button
            key={key}
            className={`${classes.filterButton} ${filter === key ? classes.activeFilter : ''}`}
            onClick={() => {
              setFilter(key);
              setSelectedOrder(null);
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={classes.content}>
        {/* Orders list */}
        <div className={classes.ordersList}>
          {filteredOrders.length === 0 ? (
            <p className={classes.noOrders}>No orders found for this status.</p>
          ) : (
            filteredOrders.map(order => (
              <div
                key={order.id}
                className={`${classes.orderSummary} ${selectedOrder?.id === order.id ? classes.selectedOrder : ''}`}
                onClick={() => handleOrderClick(order)}
                tabIndex={0}
                role="button"
                aria-pressed={selectedOrder?.id === order.id}
              >
                <h4>Order #{order.orderNumber || order.id}</h4>
                <p><strong>Customer:</strong> {order.customerName}</p>
                <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                <p><strong>Total:</strong> <Price price={order.totalPrice} /></p>
                <p><strong>Status:</strong> {orderStatuses.find(s => s.key === order.status)?.label || order.status}</p>
              </div>
            ))
          )}
        </div>

        {/* Selected order details */}
        {selectedOrder && (
          <div className={classes.orderDetails}>
            <h3>Order Details - #{selectedOrder.orderNumber || selectedOrder.id}</h3>
            <p><strong>Customer:</strong> {selectedOrder.customerName}</p>
            <p><strong>Status:</strong> {orderStatuses.find(s => s.key === selectedOrder.status)?.label || selectedOrder.status}</p>
            <p><strong>Address:</strong> {selectedOrder.deliveryAddress || 'N/A'}</p>
            <p><strong>Contact:</strong> {selectedOrder.contactPhone || 'N/A'}</p>

            <h4>Items:</h4>
            <ul className={classes.orderItems}>
              {selectedOrder.items.map(item => (
                <li key={item.id || item.productId || item._id} className={classes.orderItem}>
                  <div className={classes.itemImageWrapper}>
                    <img
                      src={item.imageUrl || item.productImage || '/placeholder-cake.jpg'}
                      alt={item.productName || item.name}
                      loading="lazy"
                    />
                  </div>
                  <div className={classes.itemInfo}>
                    <p className={classes.itemName}>{item.productName || item.name}</p>
                    <p>Quantity: {item.quantity}</p>
                    <p>Price: <pri price={item.price} /></p>
                    <p>Total: <Price price={item.quantity * item.price} /></p>
                  </div>
                </li>
              ))}
            </ul>

            <div className={classes.orderTotal}>
              <p><strong>Order Total:</strong> <Price price={selectedOrder.totalPrice} /></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

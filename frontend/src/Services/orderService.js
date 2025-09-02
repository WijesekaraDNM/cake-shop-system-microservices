import { orderApi } from '../axiosconfig';

// Get all order items
export const getAll = async () => {
  const { data } = await orderApi.get('/');
  return data;
};

// Get order item by ID
export const getById = async (orderId) => {
  const { data } = await orderApi.get(`/${orderId}`);
  return data;
};

// Get order item by ID
export const getByCustomerId = async (customerId) => {
    const { data } = await orderApi.get(`/customer/${customerId}`);
    return data;
};

// Create new order item (requires admin auth token)
export const createOrders = async (customerId, customerName, customerEmail, items, total, token) => {
  const { data } = await orderApi.post('/', {customerId, customerName, customerEmail, items, total}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

// Update order item by ID (requires admin auth token)
export const updateStatus = async (orderId, status, token) => {
  const { data } = await orderApi.patch(`/${orderId}/status`, {status}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

// Delete order item by ID (requires admin auth token)
export const deleteOrder = async (orderId, token) => {
  const { data } = await orderApi.delete(`/${orderId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

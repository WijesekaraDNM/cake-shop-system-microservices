exports.validateOrderRequest = ({ customerEmail, customerName, orderId, items, totalAmount }) => {
  if (!customerEmail || !customerName || !orderId || !items || !totalAmount) {
    return "Missing required fields: customerEmail, customerName, orderId, items, totalAmount";
  }
  return null;
};

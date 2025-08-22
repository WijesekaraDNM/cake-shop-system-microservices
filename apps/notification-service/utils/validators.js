exports.validateCombinedNotificationRequest = ({ customerEmail, customerPhone, customerName, orderId, totalAmount }) => {
  if ((!customerEmail && !customerPhone) || !customerName || !orderId || !totalAmount) {
    return "Missing required fields. Need at least one contact method (email or phone), customerName, orderId, and totalAmount";
  }
  return null;
};

exports.validateEmailRequest = ({ customerEmail, customerName, orderId, totalAmount }) => {
  if (!customerEmail || !customerName || !orderId || !totalAmount) {
    return "Missing required fields for email";
  }
  return null;
};

exports.validateSMSRequest = ({ customerPhone, customerName, orderId, totalAmount }) => {
  if (!customerPhone || !customerName || !orderId || !totalAmount) {
    return "Missing required fields for SMS";
  }
  return null;
};

exports.validateGenericSMSRequest = ({ to, message }) => {
  if (!to || !message) {
    return "Missing required fields: to and message";
  }
  return null;
};

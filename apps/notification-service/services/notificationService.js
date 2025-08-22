// services/notificationService.js
const { sendOrderConfirmationEmail } = require('./emailService');
const { sendOrderConfirmationSMS } = require('./smsService');

/**
 * Sends both email and SMS notifications for order confirmation.
 * @param {Object} orderData - The order data.
 * @returns {Promise} - A promise that resolves when both notifications are sent.
 */
async function sendOrderConfirmationNotifications(orderData) {
  const { customerEmail, customerName, orderId, items, totalAmount, customerPhone } = orderData;

  const results = {
    email: { success: false, error: null },
    sms: { success: false, error: null }
  };

  // Send email
  try {
    if (customerEmail) {
      await sendOrderConfirmationEmail(customerEmail, customerName, orderId, items, totalAmount);
      results.email.success = true;
    }
  } catch (error) {
    results.email.error = error.message;
  }

  // Send SMS
  try {
    if (customerPhone) {
      await sendOrderConfirmationSMS(customerPhone, customerName, orderId, totalAmount);
      results.sms.success = true;
    }
  } catch (error) {
    results.sms.error = error.message;
  }

  return results;
}

module.exports = {
  sendOrderConfirmationNotifications,
  sendOrderConfirmationEmail: sendOrderConfirmationEmail, // Re-export
  sendOrderConfirmationSMS: sendOrderConfirmationSMS      // Re-export
};
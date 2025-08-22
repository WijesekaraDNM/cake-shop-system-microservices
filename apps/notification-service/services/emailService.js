// services/emailService.js
const sgMail = require('@sendgrid/mail');

// Set the API key from environment variables
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Sends an order confirmation email to a customer.
 * @param {string} toEmail - The customer's email address.
 * @param {string} customerName - The customer's name.
 * @param {string} orderId - The unique order ID.
 * @param {Array} items - List of items in the order.
 * @param {number} totalAmount - The total cost of the order.
 * @returns {Promise} - A promise that resolves when the email is sent.
 */
async function sendOrderConfirmationEmail(toEmail, customerName, orderId, items, totalAmount) {
  
  // Format the items list for the email
  const itemsList = items.map(item => 
    `<li>${item.quantity} x ${item.name} - $${item.price}</li>`
  ).join('');

  const msg = {
    to: toEmail, // This comes from the request!
    from: process.env.SENDGRID_FROM_EMAIL, // From your verified sender
    subject: `Your Cake Order is Confirmed! (#${orderId})`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd;">
          <h1 style="color: #e91e63;">Thank you for your order, ${customerName}!</h1>
          <p>Your order with ID <strong>${orderId}</strong> has been confirmed and is being processed.</p>
          
          <h2>Order Summary:</h2>
          <ul>
            ${itemsList}
          </ul>
          
          <h3 style="text-align: right;">Total Amount: <span style="color: #e91e63;">$${totalAmount.toFixed(2)}</span></h3>
          
          <p>We will send you another notification when your order is out for delivery.</p>
          <br>
          <p>Happy Eating!<br>The Cake Shop Team 🎂</p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Order confirmation email successfully sent to: ${toEmail}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error.response?.body || error.message);
    // It's important to throw the error so the controller can handle it
    // (e.g., maybe the order is saved but the email failed, and you need to retry later)
    throw new Error(`Failed to send confirmation email: ${error.message}`);
  }
}

module.exports = {
  sendOrderConfirmationEmail
};
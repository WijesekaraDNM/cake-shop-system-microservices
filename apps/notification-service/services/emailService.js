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
async function sendOrderConfirmationEmail(toEmail, customerName, orderId, items, totalAmount, status) {
  
  // Format the items list for the email
  const itemsList = items.map(item => 
    `<tr>
      <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; color: #333;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; text-align: center; color: #333;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #f0f0f0; text-align: right; color: #e91e63; font-weight: 600;">LKR ${parseFloat(item.price).toFixed(2)}</td>
    </tr>`
  ).join('');

  const msg = {
    to: toEmail,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: `🎂 Your Sweet Order is Confirmed! - MD Cakes (#${orderId})`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - MD Cakes</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
          
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          body { 
            font-family: 'Poppins', Arial, sans-serif; 
            line-height: 1.6; 
            color: #333;
            background: linear-gradient(135deg, #ffeef8 0%, #fff5f5 100%);
          }
          
          .email-container {
            max-width: 650px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 15px 35px rgba(233, 30, 99, 0.1);
          }
          
          .header {
            background: linear-gradient(135deg, #e91e63 0%, #ad1457 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="cake" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23cake)"/></svg>');
            opacity: 0.3;
          }
          
          .logo {
            font-size: 2.5em;
            font-weight: 700;
            margin-bottom: 10px;
            position: relative;
            z-index: 2;
          }
          
          .tagline {
            font-size: 1.1em;
            opacity: 0.9;
            position: relative;
            z-index: 2;
          }
          
          .content {
            padding: 40px 30px;
          }
          
          .greeting {
            font-size: 1.4em;
            color: #e91e63;
            font-weight: 600;
            margin-bottom: 20px;
          }
          
          .order-info {
            background: #f8f9ff;
            border-left: 4px solid #e91e63;
            padding: 20px;
            margin: 25px 0;
            border-radius: 8px;
          }
          
          .order-id {
            font-size: 1.2em;
            font-weight: 600;
            color: #e91e63;
          }
          
          .section-title {
            font-size: 1.3em;
            font-weight: 600;
            color: #333;
            margin: 30px 0 20px 0;
            padding-bottom: 10px;
            border-bottom: 2px solid #e91e63;
          }
          
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
          }
          
          .items-table th {
            background: linear-gradient(135deg, #e91e63, #ad1457);
            color: white;
            padding: 15px 12px;
            font-weight: 600;
            text-align: left;
          }
          
          .items-table th:last-child {
            text-align: right;
          }
          
          .total-section {
            background: linear-gradient(135deg, #e91e63, #ad1457);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: right;
            margin: 25px 0;
          }
          
          .total-amount {
            font-size: 1.5em;
            font-weight: 700;
          }
          
          .status-update {
            background: #e8f5e8;
            border: 1px solid #4caf50;
            border-radius: 10px;
            padding: 20px;
            margin: 25px 0;
            text-align: center;
          }
          
          .contact-section {
            background: #f8f9ff;
            border-radius: 15px;
            padding: 25px;
            margin: 30px 0;
          }
          
          .contact-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
          }
          
          .contact-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px;
            background: white;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
          }
          
          .contact-icon {
            width: 20px;
            height: 20px;
            color: #e91e63;
          }
          
          .footer {
            background: #333;
            color: white;
            text-align: center;
            padding: 30px;
          }
          
          .footer-message {
            font-size: 1.2em;
            margin-bottom: 10px;
            color: #e91e63;
            font-weight: 600;
          }
          
          .social-links {
            margin-top: 20px;
          }
          
          .social-links a {
            color: #e91e63;
            text-decoration: none;
            margin: 0 10px;
            font-weight: 500;
          }
          
          @media (max-width: 600px) {
            .email-container { margin: 10px; }
            .header, .content { padding: 20px; }
            .contact-grid { grid-template-columns: 1fr; }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <!-- Header -->
          <div class="header">
            <div class="logo">🎂 MD Cakes</div>
            <div class="tagline">Crafting Sweet Memories, One Cake at a Time</div>
          </div>
          
          <!-- Main Content -->
          <div class="content">
            <div class="greeting">Hello ${customerName}! 👋</div>
            
            <p style="font-size: 1.1em; margin-bottom: 20px;">
              Thank you for choosing MD Cakes! We're delighted to confirm that your order has been successfully placed and is now being prepared with love and care.
            </p>
            
            <div class="order-info">
              <div class="order-id">Order ID: #${orderId}</div>
              <p style="margin-top: 10px; color: #666;">Order Date: ${new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            </div>
            
            <h2 class="section-title">📋 Order Summary</h2>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align: center;">Quantity</th>
                  <th style="text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
            </table>
            
            <div class="total-section">
              <div style="font-size: 1.1em; margin-bottom: 5px;">Total Amount</div>
              <div class="total-amount">LKR ${totalAmount.toFixed(2)}</div>
            </div>
            
            <div class="status-update">
              <strong>🔄 Order Status: ${status}</strong>
              <p style="margin-top: 10px;">We'll send you another notification as order progressed!</p>
            </div>
            
            <!-- Contact Information -->
            <div class="contact-section">
              <h3 style="color: #e91e63; margin-bottom: 15px;">📞 Contact Us</h3>
              <div class="contact-grid">
                <div class="contact-item">
                  <svg class="contact-icon" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z"/>
                  </svg>
                  <span>011-234-5667 / 076-8978908</span>
                </div>
                <div class="contact-item">
                  <svg class="contact-icon" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z"/>
                  </svg>
                  <span>230/9, MDCakes, Wattala Road, Colombo 7</span>
                </div>
                <div class="contact-item">
                  <svg class="contact-icon" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z"/>
                  </svg>
                  <span>team.mdcakes@gmail.com</span>
                </div>
                <div class="contact-item">
                  <svg class="contact-icon" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4,4H20A2,2 0 0,1 22,6V18A2,2 0 0,1 20,20H4A2,2 0 0,1 2,18V6A2,2 0 0,1 4,4M4,6V18H20V6H4Z"/>
                  </svg>
                  <span>Fax: 2345671890</span>
                </div>
              </div>
            </div>
            
            <p style="color: #666; font-style: italic; margin-top: 30px;">
              💡 <strong>Tip:</strong> Save our contact information for future orders and inquiries. We're always here to make your celebrations sweeter!
            </p>
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <div class="footer-message">Happy Eating! 🍰</div>
            <p>With Love,<br><strong>Team MD Cakes</strong></p>
            <div class="social-links">
              <a href="#">Follow us on Facebook</a> | 
              <a href="#">Instagram</a> | 
              <a href="#">WhatsApp</a>
            </div>
            <p style="font-size: 0.9em; margin-top: 15px; opacity: 0.7;">
              © 2025 MD Cakes. All rights reserved.
            </p>
          </div>
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
    throw new Error(`Failed to send confirmation email: ${error.message}`);
  }
}

module.exports = {
  sendOrderConfirmationEmail
};
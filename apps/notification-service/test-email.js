// test-email.js
require('dotenv').config(); // Load environment variables
const { sendOrderConfirmationEmail } = require('./services/emailService'); // Adjust path if needed

// Mock order data - simulate what comes from a request
const dummyOrderData = {
  customerEmail: 'rathnasirinimal1970@gmail.com', // CHANGE THIS to your actual email for testing
  customerName: 'John Doe',
  orderId: 'ORD-TEST-12345',
  items: [
    { name: 'Chocolate Fudge Cake', quantity: 1, price: 35.99 },
    { name: 'Vanilla Cupcakes (6pk)', quantity: 1, price: 24.99 }
  ],
  totalAmount: 60.98
};

async function testEmailService() {
  console.log('🚀 Testing Email Service...');
  console.log(`📧 Attempting to send email to: ${dummyOrderData.customerEmail}`);
  console.log('----------------------------------------');

  try {
    const result = await sendOrderConfirmationEmail(
      dummyOrderData.customerEmail,
      dummyOrderData.customerName,
      dummyOrderData.orderId,
      dummyOrderData.items,
      dummyOrderData.totalAmount
    );

    console.log('✅ SUCCESS: Email sent successfully!');
    console.log('📋 Details:', result);
    
  } catch (error) {
    console.error('❌ FAILED: Error sending email');
    console.error('Error message:', error.message);
    
    // More detailed error info for SendGrid
    if (error.response) {
      console.error('Status Code:', error.response.statusCode);
      console.error('Response Body:', error.response.body);
    }
  }
}

// Run the test
testEmailService();
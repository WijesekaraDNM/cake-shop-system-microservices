// test-endpoint.js
const axios = require('axios'); // Install with: npm install axios

async function testEndpoint() {
  try {
    const response = await axios.post('http://localhost:3001/api/notifications/email/order-confirmation', {
      customerEmail: 'rathnasirinimal1970@gmail.com',
      customerName: 'Test User',
      orderId: 'TEST-001',
      items: [
        { name: 'Test Cake', quantity: 1, price: 25.99 }
      ],
      totalAmount: 25.99
    });

    console.log('✅ Success:', response.data);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testEndpoint();
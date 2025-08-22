// test-endpoints.js
require("dotenv").config();
const axios = require("axios");

const BASE_URL = "http://localhost:3001/api/notifications";

async function testHealth() {
  try {
    const response = await axios.get("http://localhost:3001/health");
    console.log("🩺 Health Check:", response.data);
  } catch (error) {
    console.error("❌ Health Check Failed:", error.response?.data || error.message);
  }
}

async function testEmailNotification() {
  try {
    const response = await axios.post(`${BASE_URL}/email/order-confirmation`, {
      customerEmail: "rathnasirinimal1970@gmail.com",
      customerName: "Test User",
      orderId: "TEST-001",
      items: [{ name: "Test Cake", quantity: 1, price: 25.99 }],
      totalAmount: 25.99,
    });
    console.log("📧 Email Endpoint:", response.data);
  } catch (error) {
    console.error("❌ Email Endpoint Failed:", error.response?.data || error.message);
  }
}

async function testSMSNotification() {
  try {
    const response = await axios.post(`${BASE_URL}/sms/order-confirmation`, {
      customerPhone: "+94712053601", // must be verified in Twilio trial
      customerName: "Test User",
      orderId: "TEST-002",
      totalAmount: 30.5,
    });
    console.log("📱 SMS Endpoint:", response.data);
  } catch (error) {
    console.error("❌ SMS Endpoint Failed:", error.response?.data || error.message);
  }
}

async function testCombinedNotification() {
  try {
    const response = await axios.post(`${BASE_URL}/order-confirmation`, {
      customerEmail: "rathnasirinimal1970@gmail.com",
      customerPhone: "+94712053601",
      customerName: "Test User",
      orderId: "TEST-003",
      items: [{ name: "Chocolate Cake", quantity: 2, price: 19.99 }],
      totalAmount: 39.98,
    });
    console.log("📨 Combined Endpoint:", response.data);
  } catch (error) {
    console.error("❌ Combined Endpoint Failed:", error.response?.data || error.message);
  }
}

async function testGenericSMS() {
  try {
    const response = await axios.post(`${BASE_URL}/sms`, {
      to: "+94712053601",
      message: "🚀 This is a test generic SMS from Notification Service.",
    });
    console.log("📲 Generic SMS Endpoint:", response.data);
  } catch (error) {
    console.error("❌ Generic SMS Endpoint Failed:", error.response?.data || error.message);
  }
}

async function runTests() {
  console.log("🚀 Running Notification Service Endpoint Tests...\n");
  await testHealth();
  await testEmailNotification();
  await testSMSNotification();
  await testCombinedNotification();
  await testGenericSMS();
}

runTests();

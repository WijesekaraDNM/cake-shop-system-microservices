// services/smsService.js
const twilio = require('twilio');

// Initialize Twilio client
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

/**
 * Sends an order confirmation SMS to a customer.
 * @param {string} toPhone - The customer's phone number.
 * @param {string} customerName - The customer's name.
 * @param {string} orderId - The unique order ID.
 * @param {number} totalAmount - The total cost of the order.
 * @returns {Promise} - A promise that resolves when the SMS is sent.
 */
async function sendOrderConfirmationSMS(toPhone, customerName, orderId, totalAmount) {
  
  // Format the phone number if needed (ensure it includes country code)
  const formattedPhone = toPhone.startsWith('+') ? toPhone : `+${toPhone}`;

  const messageBody = `Hi ${customerName}! 🎂 Your cake order #${orderId} for $${totalAmount} has been confirmed. We'll notify you when it's out for delivery. Thank you!`;

  try {
    const message = await twilioClient.messages.create({
      body: messageBody,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });

    console.log(`✅ Order confirmation SMS sent to: ${formattedPhone}`);
    console.log(`📱 Message SID: ${message.sid}`);
    
    return { 
      success: true, 
      messageSid: message.sid,
      to: formattedPhone 
    };
    
  } catch (error) {
    console.error('❌ Error sending SMS:', error.message);
    
    // More detailed error logging for Twilio
    if (error.code) {
      console.error('Twilio Error Code:', error.code);
      console.error('Twilio Error Message:', error.message);
      
      // Handle specific Twilio errors
      if (error.code === 21211) {
        throw new Error('Invalid phone number format');
      } else if (error.code === 21614) {
        throw new Error('Phone number is not SMS capable');
      }
    }
    
    throw new Error(`Failed to send SMS: ${error.message}`);
  }
}

/**
 * Sends a generic SMS message.
 * @param {string} toPhone - The recipient's phone number.
 * @param {string} message - The SMS message content.
 * @returns {Promise} - A promise that resolves when the SMS is sent.
 */
async function sendSMS(toPhone, message) {
  const formattedPhone = toPhone.startsWith('+') ? toPhone : `+${toPhone}`;

  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });

    console.log(`✅ SMS sent to: ${formattedPhone}`);
    return { success: true, messageSid: result.sid };
    
  } catch (error) {
    console.error('❌ Error sending SMS:', error.message);
    throw new Error(`Failed to send SMS: ${error.message}`);
  }
}

module.exports = {
  sendOrderConfirmationSMS,
  sendSMS
};
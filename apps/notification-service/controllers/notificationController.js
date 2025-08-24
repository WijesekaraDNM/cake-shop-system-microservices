// controllers/notificationController.js
const {
  sendOrderConfirmationNotifications: notifyAll,
  sendOrderConfirmationEmail,
  sendOrderConfirmationSMS,
  sendOutForDeliverySMS,
} = require("../services/notificationService");
const { sendSMS } = require("../services/smsService");
const {
  validateCombinedNotificationRequest,
  validateEmailRequest,
  validateSMSRequest,
  validateGenericSMSRequest,
  validateOutForDeliverySMSRequest, // 👈 import it
} = require("../utils/validators");
// Combined email + SMS
exports.sendOrderConfirmationNotifications = async (req, res, next) => {
  console.log("📨 Received request for order confirmation notifications");

  try {
    const validationError = validateCombinedNotificationRequest(req.body);
    if (validationError)
      return res.status(400).json({ success: false, error: validationError });

    const results = await notifyAll(req.body);

    res.status(200).json({
      success: true,
      message: "Order confirmation notifications processed",
      results,
    });
  } catch (error) {
    console.error("❌ Error in combined notifications:", error.message);
    next(error);
  }
};

// Email-only
exports.sendOrderConfirmationEmailOnly = async (req, res, next) => {
  try {
    const validationError = validateEmailRequest(req.body);
    if (validationError)
      return res.status(400).json({ success: false, error: validationError });

    const { customerEmail, customerName, orderId, items, totalAmount, status } = req.body;
    await sendOrderConfirmationEmail(customerEmail, customerName, orderId, items, totalAmount, status);

    res.status(200).json({
      success: true,
      message: "Order confirmation email sent successfully",
    });
  } catch (error) {
    console.error("❌ Error in email notifications:", error.message);
    next(error);
  }
};

// SMS-only
exports.sendOrderConfirmationSMSOnly = async (req, res, next) => {
  try {
    const validationError = validateSMSRequest(req.body);
    if (validationError)
      return res.status(400).json({ success: false, error: validationError });

    const { customerPhone, customerName, orderId, totalAmount } = req.body;
    await sendOrderConfirmationSMS(customerPhone, customerName, orderId, totalAmount);

    res.status(200).json({
      success: true,
      message: "Order confirmation SMS sent successfully",
    });
  } catch (error) {
    console.error("❌ Error in SMS notifications:", error.message);
    next(error);
  }
};

// Generic SMS
exports.sendGenericSMS = async (req, res, next) => {
  try {
    const validationError = validateGenericSMSRequest(req.body);
    if (validationError)
      return res.status(400).json({ success: false, error: validationError });

    const { to, message } = req.body;
    await sendSMS(to, message);

    res.status(200).json({
      success: true,
      message: "SMS sent successfully",
    });
  } catch (error) {
    console.error("❌ Error in generic SMS:", error.message);
    next(error);
  }
};


exports.sendOutForDeliverySMSOnly = async (req, res, next) => {
  try {
    const validationError = validateOutForDeliverySMSRequest(req.body); // 👈 use correct validator
    if (validationError)
      return res.status(400).json({ success: false, error: validationError });

    const result = await sendOutForDeliverySMS(req.body);

    if (!result.success) {
      return res.status(500).json({ success: false, error: result.error });
    }

    res.status(200).json({
      success: true,
      message: "Out-for-delivery SMS sent successfully",
    });
  } catch (error) {
    console.error("❌ Error in out-for-delivery SMS:", error.message);
    next(error);
  }
};
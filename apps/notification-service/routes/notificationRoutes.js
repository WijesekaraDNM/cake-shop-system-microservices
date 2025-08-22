const express = require("express");
const router = express.Router();
const {
  sendOrderConfirmationNotifications,
  sendOrderConfirmationEmailOnly,
  sendOrderConfirmationSMSOnly,
  sendGenericSMS,
  sendOutForDeliverySMSOnly,
} = require("../controllers/notificationController");

// Combined email + SMS
router.post("/order-confirmation", sendOrderConfirmationNotifications);

// Email-only
router.post("/email/order-confirmation", sendOrderConfirmationEmailOnly);

// SMS-only
router.post("/sms/order-confirmation", sendOrderConfirmationSMSOnly);

// Out-for-delivery SMS
router.post("/sms/out-for-delivery", sendOutForDeliverySMSOnly);

// Generic SMS
router.post("/sms", sendGenericSMS);

module.exports = router;

const express = require("express");
const router = express.Router();
const { sendOrderConfirmation } = require("../controllers/notificationController");

// Order confirmation email route
router.post("/email/order-confirmation", sendOrderConfirmation);

module.exports = router;

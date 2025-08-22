const { sendOrderConfirmationEmail } = require("../services/emailService");
const { validateOrderRequest } = require("../utils/validators");

exports.sendOrderConfirmation = async (req, res, next) => {
  console.log("📨 Received request to send order confirmation email");

  try {
    const { customerEmail, customerName, orderId, items, totalAmount } = req.body;

    // Validate
    const validationError = validateOrderRequest(req.body);
    if (validationError) {
      return res.status(400).json({ success: false, error: validationError });
    }

    console.log(`📧 Sending confirmation email for order ${orderId} to ${customerEmail}`);

    await sendOrderConfirmationEmail(customerEmail, customerName, orderId, items, totalAmount);

    res.status(200).json({
      success: true,
      message: "Order confirmation email sent successfully",
      data: { orderId, customerEmail, customerName },
    });
  } catch (error) {
    console.error("❌ Error in order confirmation endpoint:", error.message);
    next(error);
  }
};

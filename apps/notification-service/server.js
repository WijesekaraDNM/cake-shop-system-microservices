// server.js
require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3001;

// Import the email service
const { sendOrderConfirmationEmail } = require("./services/emailService");

// Middleware to parse JSON bodies
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", service: "Notification Service" });
});

// New endpoint to send order confirmation emails
app.post("/api/notifications/email/order-confirmation", async (req, res) => {
  console.log("📨 Received request to send order confirmation email");

  try {
    // Extract data from request body
    const { customerEmail, customerName, orderId, items, totalAmount } =
      req.body;

    // Validate required fields
    if (!customerEmail || !customerName || !orderId || !items || !totalAmount) {
      return res.status(400).json({
        success: false,
        error:
          "Missing required fields: customerEmail, customerName, orderId, items, totalAmount",
      });
    }

    console.log(
      `📧 Sending confirmation email for order ${orderId} to ${customerEmail}`
    );

    // Send the email using our service
    await sendOrderConfirmationEmail(
      customerEmail,
      customerName,
      orderId,
      items,
      totalAmount
    );

    // Success response
    res.status(200).json({
      success: true,
      message: "Order confirmation email sent successfully",
      data: {
        orderId,
        customerEmail,
        customerName,
      },
    });
  } catch (error) {
    console.error("❌ Error in order confirmation endpoint:", error.message);

    res.status(500).json({
      success: false,
      error: "Failed to send order confirmation email",
      details: error.message,
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("🚨 Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

// 404 handler for undefined routes - FIXED THIS LINE
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found: " + req.originalUrl,
  });
});

app.listen(PORT, () => {
  console.log(`🎉 Notification Service running on port ${PORT}`);
  console.log(`🩺 Health check: http://localhost:${PORT}/health`);
  console.log(
    `📧 Email endpoint: POST http://localhost:${PORT}/api/notifications/email/order-confirmation`
  );
});
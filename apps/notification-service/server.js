require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 5005;

// Routes
const notificationRoutes = require("./routes/notificationRoutes");

// Middleware
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "Notification Service",
    features: ["email", "sms"],
  });
});

// API routes
app.use("/api/notifications", notificationRoutes);

// Error handling middleware
const errorHandler = require("./middlewares/errorHandler");
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.originalUrl}`,
  });
});

app.listen(PORT, () => {
  console.log(`🎉 Notification Service running on port ${PORT}`);
  console.log(`🩺 Health check: http://localhost:${PORT}/health`);
  console.log(
    `📧 Email endpoint: POST http://localhost:${PORT}/api/notifications/email/order-confirmation`
  );
  console.log(
    `📱 SMS endpoint: POST http://localhost:${PORT}/api/notifications/sms/order-confirmation`
  );
  console.log(
    `📨 Combined endpoint: POST http://localhost:${PORT}/api/notifications/order-confirmation`
  );
});

module.exports = (err, req, res, next) => {
  console.error("🚨 Unhandled error:", err.stack || err.message);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    details: err.message,
  });
};

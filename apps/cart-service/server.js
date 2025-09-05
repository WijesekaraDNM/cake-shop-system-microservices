const promBundle = require('express-prom-bundle');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const cartRoutes = require('./routes/cartRoutes');

const app = express();
const PORT = process.env.PORT || 5003;
// 1. Create and apply metrics middleware
// This automatically collects default metrics (request count, duration, etc.)
const metricsMiddleware = promBundle({
  includeMethod: true,     // Include HTTP method (GET, POST, etc.)
  includePath: true,       // Include the request path (e.g., /api/users)
  includeStatusCode: true, // Include HTTP status code (200, 404, etc.)
  promClient: {
    collectDefaultMetrics: {
      timeout: 1000 // Collect default OS metrics every second
    }
  }
});

// Apply the metrics middleware to all routes before your other middleware
app.use(metricsMiddleware);


// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI_CART || 'mongodb://localhost:27017/cake-shop-cart', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('MongoDB connection error:', error));

// Routes
app.use('', cartRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Cart service is running!', 
    timestamp: new Date().toISOString(),
    port: PORT 
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Cart service running on port ${PORT}`);
});
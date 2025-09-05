import express from 'express';
import dotenv from 'dotenv';
import {connectDB} from '../src/utils/db.js';
import foodRoutes from '../src/routes/foodRoutes.js';
import { errorHandler } from '../src/middleware/errorMiddleware.js';
import promBundle from 'express-prom-bundle';
dotenv.config();
connectDB();

const app = express();

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

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('', foodRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Food service running on port ${PORT}`));

import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

// Enable CORS for your frontend domain or all origins during development
app.use(cors({
  origin: 'http://localhost:3000', // Change '*' to your frontend URL in production, e.g., 'http://localhost:3000'
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

// Proxy /api/food requests to foodService running on http://localhost:5001
app.use('/api/food', createProxyMiddleware({
  target: 'http://localhost:5001',
  changeOrigin: true,
  pathRewrite: {
    '^/api/food': '/api/food', // optional if paths are the same
  },
}));

// Proxy /api/user requests to userService running on http://localhost:5002
app.use('/api/user', createProxyMiddleware({
  target: 'http://localhost:5002',
  changeOrigin: true,
  pathRewrite: { '^/api/user': '/api/user' }
}));

// Proxy /api/user requests to userService running on http://localhost:5003
app.use('/api/cart', createProxyMiddleware({
  target: 'http://localhost:5003',
  changeOrigin: true,
  pathRewrite: { '^/api/cart': '/api/cart' }
}));

// Proxy /api/user requests to userService running on http://localhost:5004
app.use('/api/order', createProxyMiddleware({
  target: 'http://localhost:5004',
  changeOrigin: true,
  pathRewrite: { '^/api/order': '' }
}));

// Add more proxies for other microservices here

const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});

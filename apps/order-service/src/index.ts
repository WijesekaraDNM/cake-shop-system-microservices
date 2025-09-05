import express from 'express';
import dotenv from 'dotenv';
import { z } from 'zod';
import bodyParser from 'body-parser';
import db from './db.js';
import { sendRabbitMessages, MessageData, OrderItem } from './message.js';
// Import the prom-client package for metrics
import promBundle from 'express-prom-bundle';

dotenv.config();

const app = express();

// 1. Create and apply metrics middleware
// This automatically collects default metrics (request count, duration, etc.)
const metricsMiddleware = promBundle({
  includeMethod: true,     // Include HTTP method (GET, POST, etc.)
  includePath: true,       // Include the request path (e.g., /api/orders)
  includeStatusCode: true, // Include HTTP status code (200, 404, etc.)
  promClient: {
    collectDefaultMetrics: {
      // timeout: 1000 // Collect default OS metrics every second
    }
  }
});

// Apply the metrics middleware to all routes before your other middleware
app.use(metricsMiddleware);

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const CreateOrder = z.object({
  customerId: z.string().min(2),
  items: z.array(
    z.object({
      itemId: z.string(),
      name: z.string(),
      quantity: z.number().positive(),
      price: z.number().positive()
    })
  ),
  total: z.number().positive(),
});

app.get('/health', (_req, res) => res.send('ok'));
app.get('/', async (_req, res) => {
  try {
    const orders = await db.order.findMany();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' + err });
  }
});

//create order
app.post('/', async (req, res) => {
  const { customerId, customerName, customerEmail, items, total } = req.body;
  const order = await db.order.create({
    data: { customerId, items, total, status: 'pending' }
  });
  let itemsList: OrderItem[] = [];

  if(items.length != 0) {
    itemsList = items.map((item: any) => ({
      itemId: item.itemId,
      name: item.name,
      quantity: item.quantity,
      price: item.price
    }));
  }
  const message: MessageData = {
    orderId: order.id,
    customerName: customerName,
    customerEmail: customerEmail,
    totalAmount: order.total,
    items: itemsList,
    status: "Pending"
  };
  sendRabbitMessages(1, 'email', message);
  res.status(201).json(order);
});

// Get order by id
app.get('/:id', async (req, res) => {
  try {
    const order = await db.order.findUnique({
      where: { id: req.params.id },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

//get order by customer
app.get('/customer/:customerId', async (req, res) => {
  try {
    const orders = await db.order.findMany({
      where: { customerId: req.params.customerId },
    });
    if (!orders) return res.status(404).json({ error: 'Orders not found' });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Update order status
app.patch('/:id/status', async (req, res) => {
  try {
    const order = await db.order.update({
      where: { id: req.params.id },
      data: { status: req.body.status, updatedAt: new Date() },
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Cancel order
app.delete('/:id', async (req, res) => {
  try {
    await db.order.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// 2. The /metrics endpoint is automatically exposed by express-prom-bundle
// No need to manually create it - Prometheus can scrape from /metrics

const PORT = process.env.PORT || 5004;
app.listen(PORT, () => {
  console.log(`order-svc on :${PORT}`);
  console.log(`Metrics available at http://localhost:${PORT}/metrics`);
});
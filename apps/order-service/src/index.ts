import express from 'express';
import dotenv from 'dotenv';
import { z } from 'zod';
import bodyParser from 'body-parser';
import db from './db.js';
dotenv.config();

const app = express();
app.use(bodyParser.json());

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
app.get('/orders', async (_req, res) => {
  try {
    const orders = await db.order.findMany();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

//create order
app.post('/orders', async (req, res) => {
  const { customerId, items, total } = req.body;
  const order = await db.order.create({
    data: { customerId, items, total, status: 'pending' }
  });
  res.status(201).json(order);
});

// Get order by id
app.get('/orders/:id', async (req, res) => {
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

// Update order status
app.patch('/orders/:id/status', async (req, res) => {
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
app.delete('/orders/:id', async (req, res) => {
  try {
    await db.order.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`order-svc on :${PORT}`));
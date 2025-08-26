import express from 'express';
import dotenv from 'dotenv';
import {connectDB} from '../src/utils/db.js';
import foodRoutes from '../src/routes/foodRoutes.js';
import { errorHandler } from '../src/middleware/errorMiddleware.js';

dotenv.config();
connectDB();

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('', foodRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Food service running on port ${PORT}`));

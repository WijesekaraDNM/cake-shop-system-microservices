import express from 'express';
import dotenv from 'dotenv';
import {connectDB} from '../src/utils/db.js';
import userRoutes from '../src/routes/userRoutes.js';
import { errorHandler } from '../src/middleware/errorMiddleware.js';

dotenv.config();
connectDB();

const app = express();

app.use(express.json());

app.use('', userRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => console.log(`User service running on port ${PORT}`));

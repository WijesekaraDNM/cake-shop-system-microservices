const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./utils/db');
const foodRoutes = require('./routes/foodRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();
connectDB();

const app = express();

app.use(express.json());

app.use('/api/food', foodRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Food service running on port ${PORT}`));

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB } = require('./utils/db');
const authRoutes = require('./routes/auth');
const barbersRoutes = require('./routes/barbers');
const servicesRoutes = require('./routes/services');
const appointmentsRoutes = require('./routes/appointments');
const dashboardRoutes = require('./routes/dashboard');
const shopsRoutes = require('./routes/shops');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Connect to PostgreSQL (NeonDB)
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/barbers', barbersRoutes);
app.use('/services', servicesRoutes);
app.use('/appointments', appointmentsRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/shops', shopsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`BarberFlow API running on http://localhost:${PORT}`);
});

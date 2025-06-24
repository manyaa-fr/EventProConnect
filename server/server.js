const originalEmit = process.emit;
process.emit = function (name, data, ...args) {
  if (name === 'warning' && data.name === 'DeprecationWarning') {
    return false; // Suppress completely
  }
  return originalEmit.apply(process, arguments);
};


require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const colors = require('colors');
const errorHandler = require('./middlewares/error');
const connectDB = require('./config/db');

// Load environment variables
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize Express
const app = express();

// =====================
// 1. Database Connection
// =====================
connectDB();

// =====================
// 2. Middleware Stack
// =====================
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Security Middleware
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
app.use(hpp());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
app.use(limiter);

// CORS Configuration
app.use(cors({
  origin: NODE_ENV === 'development' 
    ? 'http://localhost:3000' 
    : process.env.CLIENT_URL,
  credentials: true
}));

// =====================
// 3. Routes
// =====================
// Health Check Endpoint (Add this first)
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API Routes
const apiRoutes = require('./routes');
app.use('/api/v1', apiRoutes);

// =====================
// 4. Error Handling
// =====================
app.use(errorHandler);

// =====================
// 5. Production Setup
// =====================
if (NODE_ENV === 'production') {
  // Serve static files from React
  app.use(express.static(path.join(__dirname, '../client/build')));

  // Handle React routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// =====================
// 6. Server Initialization
// =====================
const server = app.listen(PORT, () => {
  console.log(`
  ========================================================
  🚀 Server running in ${NODE_ENV} mode on port ${PORT}
  ========================================================
  `.cyan.bold);
});

// Event Listeners
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected successfully'.green);
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:'.red, err.message);
});

process.on('unhandledRejection', (err, promise) => {
  console.error('❌ Unhandled Rejection:'.red, err.message);
  server.close(() => process.exit(1));
});

process.on('warning', (warning) => {
  console.warn('⚠️ Node Warning:'.yellow, warning.name, '-', warning.message);
});
// File: backend/routes/index.js
const express = require('express');
const router = express.Router();

// Import all route files
const authRoutes = require('./auth');
const eventRoutes = require('./events');
const bookingRoutes = require('./bookings');
const reviewRoutes = require('./reviews');

// Mount routes
router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/bookings', bookingRoutes);
router.use('/reviews', reviewRoutes);

module.exports = router;
// File: backend/routes/events.js
const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  uploadEventPhoto
} = require('../controllers/events');
const { protect, authorize } = require('../middlewares/auth');
const advancedResults = require('../middlewares/advancedResults');
const Event = require('../models/event');

// Public routes
router.get('/', advancedResults(Event, 'organizer'), getEvents);
router.get('/:id', getEvent);

// Protected routes (Organizer/Admin only)
router.use(protect);
router.post('/', authorize('organizer', 'admin'), createEvent);
router.put('/:id', authorize('organizer', 'admin'), updateEvent);
router.delete('/:id', authorize('organizer', 'admin'), deleteEvent);
router.put('/:id/photo', authorize('organizer', 'admin'), uploadEventPhoto);

module.exports = router;
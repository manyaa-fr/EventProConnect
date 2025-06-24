const express = require('express');
const router = express.Router();
const {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking
} = require('../controllers/bookings');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect);

// User-accessible routes
router.post('/', createBooking);
router.get('/:id', getBooking);

// Admin-only routes
router.use(authorize('admin'));
router.get('/', getBookings);
router.put('/:id', updateBooking);
router.delete('/:id', deleteBooking);

module.exports = router;
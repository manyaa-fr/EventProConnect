// File: backend/routes/reviews.js
const express = require('express');
const router = express.Router();
const {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview
} = require('../controllers/reviews');
const { protect, authorize } = require('../middlewares/auth');

// Public
router.get('/', getReviews);
router.get('/:id', getReview);

// Protected
router.use(protect);
router.post('/:eventId', addReview);
router.put('/:id', authorize('user', 'admin'), updateReview);
router.delete('/:id', authorize('user', 'admin'), deleteReview);

module.exports = router;
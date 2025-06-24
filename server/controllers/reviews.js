const Review = require('../models/review');
const Event = require('../models/event');
const Booking = require('../models/booking'); // Added missing import
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all reviews
exports.getReviews = async (req, res, next) => {
  try {
    // Optional: Add filtering/pagination later
    const reviews = await Review.find()
      .populate('user', 'name avatar')
      .populate('event', 'title');
      
    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single review
exports.getReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'name avatar')
      .populate('event', 'title');

    if (!review) {
      return next(new ErrorResponse(`Review not found with id ${req.params.id}`, 404));
    }

    res.status(200).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

// @desc    Add review
exports.addReview = async (req, res, next) => {
  try {
    // Verify user attended the event
    const booking = await Booking.findOne({
      user: req.user.id,
      event: req.params.eventId,
      paymentStatus: 'paid'
    });
    
    if (!booking) {
      return next(new ErrorResponse('Not authorized to review (must attend event first)', 401));
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      user: req.user.id,
      event: req.params.eventId
    });
    
    if (existingReview) {
      return next(new ErrorResponse('You already reviewed this event', 400));
    }

    const review = await Review.create({
      ...req.body,
      user: req.user.id,
      event: req.params.eventId
    });

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

// @desc    Update review
exports.updateReview = async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id);
    
    if (!review) {
      return next(new ErrorResponse(`Review not found with id ${req.params.id}`, 404));
    }

    // Verify user owns the review or is admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to update this review', 403));
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete review
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return next(new ErrorResponse(`Review not found with id ${req.params.id}`, 404));
    }

    // Verify user owns the review or is admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to delete this review', 403));
    }

    await review.remove();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
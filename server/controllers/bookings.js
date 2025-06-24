const Booking = require('../models/booking');
const Event = require('../models/event');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all bookings (Admin only)
exports.getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find().populate('user event');
    res.status(200).json({ 
      success: true,
      count: bookings.length,
      data: bookings 
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single booking
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
                          .populate('user event');
    
    if (!booking) {
      return next(new ErrorResponse(`Booking not found with id ${req.params.id}`, 404));
    }

    // Verify user owns booking or is admin
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`Not authorized to access this booking`, 401));
    }

    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

// @desc    Create booking (without payment)
exports.createBooking = async (req, res, next) => {
  try {
    const event = await Event.findById(req.body.event);
    if (!event) {
      return next(new ErrorResponse('Event not found', 404));
    }

    // Check ticket availability
    if (event.ticketsAvailable < req.body.tickets) {
      return next(new ErrorResponse(`Only ${event.ticketsAvailable} tickets remaining`, 400));
    }

    // Create booking
    const booking = await Booking.create({
      event: req.body.event,
      user: req.user.id,
      tickets: req.body.tickets,
      totalPrice: event.price * req.body.tickets,
      paymentStatus: 'pending' // Mark as unpaid
    });

    // Update event inventory
    event.ticketsAvailable -= req.body.tickets;
    await event.save();

    res.status(201).json({ 
      success: true, 
      data: booking 
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Update booking (Admin only)
exports.updateBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);
    if (!booking) {
      return next(new ErrorResponse('Booking not found', 404));
    }

    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete booking (Admin only)
exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return next(new ErrorResponse('Booking not found', 404));
    }

    // Restore tickets to event
    const event = await Event.findById(booking.event);
    event.ticketsAvailable += booking.tickets;
    await event.save();

    await booking.remove();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
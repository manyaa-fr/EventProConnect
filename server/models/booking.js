// backend/models/Booking.js
const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.ObjectId,
    ref: 'Event',
    required: [true, 'Booking must belong to an event']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a user']
  },
  tickets: {
    type: Number,
    required: [true, 'Please specify number of tickets'],
    min: [1, 'Minimum 1 ticket required']
  },
  totalPrice: {
    type: Number,
    required: [true, 'Booking must have a total price']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'bank'],
    required: [true, 'Please select payment method']
  },
  paymentId: String, // Payment gateway transaction ID
  bookedAt: {
    type: Date,
    default: Date.now
  },
  qrCode: String, // Cloudinary URL for QR check-in
  expiresAt: Date // For holding reservations
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Prevent duplicate bookings
BookingSchema.index({ event: 1, user: 1 }, { unique: true });

// Auto-calculate total price before save
BookingSchema.pre('save', async function(next) {
  if (!this.isModified('tickets')) return next();
  
  const event = await mongoose.model('Event').findById(this.event);
  this.totalPrice = this.tickets * event.price;
  
  // Set expiration for pending payments (30min hold)
  if (this.paymentStatus === 'pending') {
    this.expiresAt = new Date(Date.now() + 30 * 60 * 1000); 
  }
  next();
});

// Update event ticket availability
BookingSchema.post('save', async function(doc) {
  if (doc.paymentStatus === 'paid') {
    await mongoose.model('Event').findByIdAndUpdate(doc.event, {
      $inc: { ticketsAvailable: -doc.tickets }
    });
  }
});

// Handle refunds/cancellations
BookingSchema.post('findOneAndUpdate', async function(doc) {
  if (this._update.paymentStatus === 'refunded' || 
      this._update.paymentStatus === 'cancelled') {
    await mongoose.model('Event').findByIdAndUpdate(doc.event, {
      $inc: { ticketsAvailable: doc.tickets }
    });
  }
});

module.exports = mongoose.model('Booking', BookingSchema);
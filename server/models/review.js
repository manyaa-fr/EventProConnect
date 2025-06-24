// backend/models/Review.js
const mongoose = require('mongoose');
const Event = require('./event');

const ReviewSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.ObjectId,
    ref: 'Event',
    required: [true, 'Review must belong to an event']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to a user']
  },
  rating: {
    type: Number,
    required: [true, 'Please add a rating'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: {
    type: String,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Prevent duplicate reviews from same user
ReviewSchema.index({ event: 1, user: 1 }, { unique: true });

// Static method to calculate average rating
ReviewSchema.statics.calcAverageRating = async function(eventId) {
  const stats = await this.aggregate([
    {
      $match: { event: eventId }
    },
    {
      $group: {
        _id: '$event',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await Event.findByIdAndUpdate(eventId, {
      ratingQuantity: stats[0].nRating,
      ratingAverage: stats[0].avgRating
    });
  } else {
    await Event.findByIdAndUpdate(eventId, {
      ratingQuantity: 0,
      ratingAverage: 4.5 // Default if no reviews
    });
  }
};

// Update event ratings after saving review
ReviewSchema.post('save', function() {
  this.constructor.calcAverageRating(this.event);
});

// Update event ratings after removing review
ReviewSchema.post('remove', function() {
  this.constructor.calcAverageRating(this.event);
});

// Populate user data when querying reviews
ReviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name avatar'
  });
  next();
});

module.exports = mongoose.model('Review', ReviewSchema);
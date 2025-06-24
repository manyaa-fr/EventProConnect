const mongoose = require('mongoose');
const slugify = require('slugify');

// Check if model already exists
if (mongoose.models.Event) {
  module.exports = mongoose.model('Event');
} else {
  const EventSchema = new mongoose.Schema({
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    slug: String,
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    date: {
      type: Date,
      required: [true, 'Please add event date'],
      index: true
    },
    location: {
      venue: {
        type: String,
        required: [true, 'Please add venue name']
      },
      city: {
        type: String,
        required: [true, 'Please add city'],
        index: true
      },
      address: String,
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          required: true
        },
        coordinates: {
          type: [Number],
          required: true,
          validate: {
            validator: function(v) {
              return v.length === 2 && 
                     v[0] >= -180 && v[0] <= 180 && 
                     v[1] >= -90 && v[1] <= 90;
            },
            message: props => `${props.value} is not a valid coordinate!`
          }
        }
      }
    },
    category: {
      type: String,
      required: true,
      enum: ['Music', 'Sports', 'Tech', 'Food', 'Art', 'Business', 'Education'],
      index: true
    },
    price: {
      type: Number,
      required: [true, 'Please add price'],
      min: [0, 'Price cannot be negative']
    },
    ticketsAvailable: {
      type: Number,
      required: [true, 'Please specify ticket quantity'],
      min: [0, 'Ticket count cannot be negative']
    },
    images: {
      type: [String],
      validate: {
        validator: function(v) {
          return v.length > 0;
        },
        message: 'At least one image is required'
      }
    },
    organizer: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    highlights: [{
      image: String,
      caption: String,
      postedAt: {
        type: Date,
        default: Date.now
      }
    }],
    ratingAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be at least 1.0'],
      max: [5, 'Rating cannot exceed 5.0'],
      set: val => Math.round(val * 10) / 10
    },
    ratingQuantity: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  });

  // Create event slug from title
  EventSchema.pre('save', function(next) {
    this.slug = slugify(this.title, { lower: true });
    next();
  });

  // Reverse populate with virtuals
  EventSchema.virtual('bookings', {
    ref: 'Booking',
    localField: '_id',
    foreignField: 'event',
    justOne: false
  });

  EventSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'event',
    justOne: false
  });

  // Geospatial indexing
  EventSchema.index({ 'location.coordinates': '2dsphere' });

  // Cascade delete
  EventSchema.pre('remove', async function(next) {
    await this.model('Booking').deleteMany({ event: this._id });
    await this.model('Review').deleteMany({ event: this._id });
    next();
  });

  module.exports = mongoose.model('Event', EventSchema);
}
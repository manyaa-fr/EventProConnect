const Joi = require('joi');
const { objectId } = require('./custom.validation');

// Validation for creating an event
const createEvent = {
  body: Joi.object().keys({
    title: Joi.string().required().min(5).max(100)
      .messages({
        'string.empty': 'Event title cannot be empty',
        'string.min': 'Event title must be at least 5 characters',
        'string.max': 'Event title cannot exceed 100 characters'
      }),
    description: Joi.string().required().min(20).max(500),
    date: Joi.date().required().min('now')
      .message('Event date must be in the future'),
    location: Joi.object({
      venue: Joi.string().required(),
      city: Joi.string().required(),
      address: Joi.string().required(),
      coordinates: Joi.array().items(Joi.number()).length(2)
    }).required(),
    price: Joi.number().required().min(0),
    ticketsAvailable: Joi.number().required().min(1),
    category: Joi.string().valid(
      'Music', 'Sports', 'Tech', 'Food', 'Art', 'Business', 'Education'
    ).required(),
    images: Joi.array().items(Joi.string().uri()).min(1)
  })
};

// Validation for updating an event
const updateEvent = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId).required()
  }),
  body: Joi.object().keys({
    title: Joi.string().min(5).max(100),
    description: Joi.string().min(20).max(500),
    date: Joi.date().min('now'),
    // ...other fields (same as create but all optional)
  }).min(1) // At least one field to update
};

module.exports = {
  createEvent,
  updateEvent
};
const Joi = require('joi');
const { ObjectId } = require('mongodb');

// Custom MongoDB ObjectId validator
const objectId = (value, helpers) => {
  if (!ObjectId.isValid(value)) {
    return helpers.message('"{{#label}}" must be a valid mongo id');
  }
  return value;
};

module.exports = {
  objectId
};
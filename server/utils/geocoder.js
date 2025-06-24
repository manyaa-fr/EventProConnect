const NodeGeocoder = require('node-geocoder');

const options = {
  provider: process.env.GEOCODER_PROVIDER || 'mapquest',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null, // 'gpx', 'string', etc.
  httpAdapter: 'https',
};

const geocoder = NodeGeocoder(options);

// Example usage:
// const loc = await geocoder.geocode('123 Main St, Boston MA');
module.exports = geocoder;
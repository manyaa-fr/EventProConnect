const mongoose = require('mongoose');
const colors = require('colors');

const connectDB = async () => {
  try {
    // Modern connection without deprecated options
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
  } catch (err) {
    console.error(`❌ MongoDB Connection Error: ${err.message}`.red.bold);
    process.exit(1);
  }
};

module.exports = connectDB;
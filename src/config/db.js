const mongoose = require('mongoose');

async function connectDB(uri) {
  try {
    await mongoose.connect(uri, { autoSelectFamily: false });
    console.log('✅ MongoDB connected:', mongoose.connection.host);
  } catch (error) {
    throw new Error(`Database connection failed: ${error.message}`);
  }
}

module.exports = connectDB;
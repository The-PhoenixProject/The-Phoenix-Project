// config/database.js
const mongoose = require('mongoose');
const logger = require('../utlis/logger');

const connectDB = async () => {
    try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Options for better connection handling
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    });

    logger.info(` MongoDB Connected: ${conn.connection.host}`);
    logger.info(` Database Name: ${conn.connection.name}`);

    // Connection event handlers
    mongoose.connection.on('error', (err) => {
      logger.error(' MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn(' MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info(' MongoDB reconnected successfully');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        logger.info('🔒MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        logger.error(' Error during MongoDB shutdown:', err);
        process.exit(1);
      }
    });

  } catch (error) {
    logger.error(' MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
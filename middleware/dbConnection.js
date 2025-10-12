// Database connection middleware
const mongoose = require('mongoose');

const checkDatabaseConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database connection not ready. Please try again in a moment.',
      code: 'DATABASE_NOT_READY',
      status: mongoose.connection.readyState
    });
  }
  next();
};

const waitForDatabase = async (req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    return next();
  }

  // Wait for connection with timeout
  const timeout = 10000; // 10 seconds
  const startTime = Date.now();

  while (mongoose.connection.readyState !== 1) {
    if (Date.now() - startTime > timeout) {
      return res.status(503).json({
        message: 'Database connection timeout. Please try again later.',
        code: 'DATABASE_TIMEOUT'
      });
    }
    await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms
  }

  next();
};

module.exports = {
  checkDatabaseConnection,
  waitForDatabase
};

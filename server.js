const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');
const { logger } = require('./utils/logger');

dotenv.config();

// Catch synchronous programmer errors
// Must be registered before any other code runs
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT_EXCEPTION', {
    message: err.message,
    stack: err.stack,
  });
  // Process is in an undefined state after an uncaught exception — exit immediately.
  process.exit(1);
});

// Connect to database
const DB = process.env.DATABASE;
mongoose.set('strictQuery', false);
mongoose.connect(DB).then(() => logger.info('Connected to database'));

// Start server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  logger.info(`App running on port ${port}`);
});

// Catch unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED_REJECTION', {
    message: err.message,
    stack: err.stack,
  });
  server.close(() => process.exit(1));
});

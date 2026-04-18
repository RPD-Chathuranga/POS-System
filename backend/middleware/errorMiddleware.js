const logger = require('../utils/logger');

const notFound = (req, res, next) => {
  res.status(404).json({ success: false, message: 'Route not found' });
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  logger.error(err);
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

module.exports = { notFound, errorHandler };
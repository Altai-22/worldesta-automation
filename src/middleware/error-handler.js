error-handler.jsconst logger = require('../utils/logger');

// Custom error class
class AppError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status || 500;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Validation error handler
const handleValidationError = (error) => {
  const message = Object.values(error.errors)
    .map(err => err.message)
    .join(', ');
  return new AppError(message, 400);
};

// JWT error handler
const handleJWTError = () => new AppError('Invalid token', 401);
const handleJWTExpiredError = () => new AppError('Token expired', 401);

// Global error handling middleware
const globalErrorHandler = (err, req, res, next) => {
  err.status = err.status || 500;
  err.message = err.message || 'Internal Server Error';

  // Wrong MongoDB ID error
  if (err.name === 'CastError') {
    const message = `Resource not found: Invalid ${err.path}`;
    err = new AppError(message, 400);
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') err = handleJWTError();
  if (err.name === 'TokenExpiredError') err = handleJWTExpiredError();

  logger.error(`${err.status} - ${err.message}`, err);

  res.status(err.status).json({
    success: false,
    error: {
      status: err.status,
      message: err.message,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

// Async error wrapper
const catchAsyncError = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  AppError,
  globalErrorHandler,
  catchAsyncError,
  handleValidationError
};

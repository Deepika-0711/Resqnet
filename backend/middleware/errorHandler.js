function errorHandler(err, req, res, next) {
  console.error('[API Error]', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Emergency Coordination Server Error';

  return res.status(statusCode).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  });
}

module.exports = errorHandler;

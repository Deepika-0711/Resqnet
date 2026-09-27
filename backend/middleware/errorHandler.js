/**
 * ARCHITECTURAL BOUNDARY:
 * Centralized API Error Handling Middleware.
 *
 * Catches unhandled errors across Express routes and controllers,
 * logs failure context, and returns a standardized error payload to clients.
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Emergency Coordination Server Error';

  console.error(`[RESQNET API Error] ${req.method} ${req.originalUrl} (${statusCode}): ${message}`);
  if (err.stack && process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  return res.status(statusCode).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
}

module.exports = errorHandler;


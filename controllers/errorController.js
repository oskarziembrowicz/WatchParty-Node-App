module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // SECURITY NOTE: Returning the full error object and stack trace to the client is an information
  //                disclosure vulnerability. In production, send a generic message for 5xx errors
  //                and log the details server-side only (e.g. with Winston or a similar logger).
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  console.error(err);
  if (res.headersSent) return next(err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const body = { message };
  if (err.details) body.details = err.details;
  res.status(status).json(body);
}

module.exports = { notFound, errorHandler };

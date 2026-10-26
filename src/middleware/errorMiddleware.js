function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}
function errorHandler(err, _req, res, _next) {
  console.error(err);
  if (err.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid resource ID.' });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ success: false, message: 'Malformed JSON request body.' });
  if (err.code === 11000) return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
  const status = err.statusCode || 500;
  res.status(status).json({ success: false, message: status === 500 ? 'Internal server error.' : err.message });
}
module.exports = { notFound, errorHandler };

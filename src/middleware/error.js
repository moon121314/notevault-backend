function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid id format' });
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((e) => e.message).join(', ');
    return res.status(400).json({ message });
  }
  if (err.code === 11000) return res.status(409).json({ message: 'Duplicate value', fields: err.keyValue });
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
}

module.exports = { notFound, errorHandler };
export function errorHandler(err, req, res, next) {
  const status = err.message || 500;
  const message = err.message || 'Something went wrong';
  return res.status(status).json({ message });
}

export function notFound(req, res) {
  res.status(404).json({ error: "API endpoint not found" });
}

export function apiError(error, req, res, next) {
  if (res.headersSent) return next(error);
  const status = res.statusCode >= 400 ? res.statusCode : error.status || 500;
  if (status >= 500) console.error(error);
  res.status(status).json({ error: status >= 500 ? "Internal server error" : error.message,
    ...(error.errors ? { errors: error.errors } : {}) });
}

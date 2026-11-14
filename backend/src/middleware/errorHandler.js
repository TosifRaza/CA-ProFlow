const errorHandler = (err, req, res, next) => {
  console.error('[Error Details]:', err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Prisma specific errors
  if (err.code === 'P2002') {
    statusCode = 409;
    message = 'A record with this field already exists.';
  } else if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Requested record not found.';
  } else if (err.name === 'SyntaxError') {
    statusCode = 400;
    message = 'Malformed JSON request body.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;

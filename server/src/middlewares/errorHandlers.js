// Handle 404 errors
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
      error: 'Not Found',
      message: `Cannot find ${req.originalUrl}`,
  });
};

// Handle other errors
const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging
  res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error',
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};

const ErrorHandler = require("../util/errorHandler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  if (err.name === "CastError") {
    const message = `Resourse not found with this id... Invalid ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // Duplicate Key
  if (err.code === 11000) {
    const message = `Duplicate key ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(message, 400);
  }

  // Wrong JWT ERROR
  if (err.name === "JsonWebTokenError") {
    const message = `Your URL is Invalid. Please Try Again Later`;
    err = new ErrorHandler(message, 400);
  }

  // JWT EXPIRED
  if (err.name === "TokenExpiredError") {
    const message = `Your URL has Expired. Please Try Again Later`;
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

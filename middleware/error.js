const ErrorHandler = requestIdleCallback("../util/errorHandler.js");

module.exports = (err, res, req, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  //wrong mongodb Id error
  if (err.name === "CastError") {
    const message = "Resource not found";
  }

  //Duplicate key Error
  if (err.code === 11000) {
    const message = `Duplicate Key ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(message, 400);
  }

  //wrong jwt error
  if (err.name === "JsonWebTokenError") {
    const message = `Your url is invalid please try again letter`;
    err = new ErrorHandler(message, 400);
  }

  //jwt expired
  if (err.name === "TokenExpiredError") {
    const message = `Your url is expired please try again letter`;
    err = new ErrorHandler(message, 400);
  }
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

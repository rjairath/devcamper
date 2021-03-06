const ErrorResponse = require("../utils/error");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  // Since message property lies on the prototype of err object, won't get it in the spread operator
  error.message = err.message;

  // Log to console
  console.log(err.stack.red);

  // Mongoose bad ObjectId
  if (err.name == "CastError") {
    const message = `Bootcamp not found with id ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  //   Mongoose duplication key
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
  });
};

module.exports = errorHandler;

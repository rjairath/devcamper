const jwt = require("jsonwebtoken");
const asyncHandler = require("./async");
const ErrorResponse = require("../utils/error");
const User = require("../models/User");

// Protected Route
// Modify req object to add the user extracted from header/cookie
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // if(req.cookies.token) {
  //     token = req.cookies.token;
  // }

  // Verify the token
  if (!token) {
    return next(new ErrorResponse("Not Authorized", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    console.log(err, "token issue");
    return next(new ErrorResponse("Not Authorized", 401));
  }
});

// Verify roles
exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(
      new ErrorResponse(
        `User role ${req.user.role} not authorized to access this route`,
        403
      )
    );
  }
  next();
};

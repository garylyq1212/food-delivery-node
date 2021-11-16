const jwt = require('jsonwebtoken');

const { VendorUser, sequelize } = require('../models');
const asyncHandler = require('./async.middleware');
const { ErrorResponse } = require('../utils');

// Protected route
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Set token from headers
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    // Set token from cookie
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('No authorize to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // console.log(decoded);

    await sequelize.transaction(async (t) => {
      req.vendorUser = await VendorUser.findByPk(decoded.id, { transaction: t },);

      next();
    });


  } catch (err) {
    return next(new ErrorResponse('No authorize to access this route', 401));
  }
});

// Grant access to specific roles
exports.vendorRolesAuthorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.vendorUser.role)) {
      return next(new ErrorResponse(`Vendor role ${req.vendorUser.role} is not authorized to access this route.`, 403));
    }

    next();
  }
};
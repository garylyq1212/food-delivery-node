const { errorHandler, validationErrorHandler } = require('./error.middleware');
const asyncHandler = require('./async.middleware');
const { protect, vendorRolesAuthorize } = require('./auth.middleware');
const findRestaurant = require('./findRestaurant.middleware');

module.exports = {
  errorHandler,
  asyncHandler,
  validationErrorHandler,
  protect,
  findRestaurant,
  vendorRolesAuthorize,
};
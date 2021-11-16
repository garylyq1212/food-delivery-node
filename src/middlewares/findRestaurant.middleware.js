const { sequelize, Restaurant } = require('../models');
const asyncHandler = require('./async.middleware');
const { ErrorResponse } = require('../utils');

const findRestaurant = asyncHandler(async (req, res, next) => {
    await sequelize.transaction(async (t) => {
        req.restaurant = await Restaurant.findByPk(req.params.restaurantId, { transaction: t });

        if (!req.restaurant) {
            return next(new ErrorResponse(`Restaurant not found with id of ${req.params.restaurantId}`, 404));
        }

        next();
    });
});

module.exports = findRestaurant;
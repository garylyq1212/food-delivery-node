const path = require('path');
const { body } = require('express-validator');


const { sequelize, VendorUser, Restaurant, RestaurantFood } = require('../models');
const { asyncHandler, validationErrorHandler } = require('../middlewares');
const { ErrorResponse } = require('../utils');
const { uploadImageToStorage } = require('../config/firebase');

exports.getRestaurants = asyncHandler(async (req, res, next) => {

    // TODO(gary): Pagination

    const restaurants = await Restaurant.findAndCountAll({
        where: {
            vendorUserId: req.vendorUser.id,
        },
        include: [
            {
                model: VendorUser,
                as: 'vendorUser',
                attributes: {
                    exclude: ['password', 'resetPasswordToken', 'resetPasswordExpire', 'createdAt', 'updatedAt'],
                },
            },
        ],

    });

    res.status(200).json({
        data: {
            restaurants: restaurants,
        },
        success: true,
    });


});

exports.showRestaurant = asyncHandler(async (req, res, next) => {

    const restaurant = await Restaurant.findOne({
        where: {
            id: req.params.id,
        },
        include: {
            model: RestaurantFood,
            as: 'foods',
            attributes: {
                exclude: ['createdAt', 'updatedAt'],
            }
        },
    });

    if (!restaurant) {
        return next(new ErrorResponse(`Restaurant not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        data: {
            restaurant: restaurant,
        },
        success: true,
    });

});

exports.createRestaurant = [
    body('name').notEmpty(),
    body('email').notEmpty().isEmail().normalizeEmail(),
    body('phone').notEmpty().isMobilePhone(['ms-MY'], { strictMode: true, }).withMessage('Only accept mobile phone number'),
    body('address').notEmpty(),
    validationErrorHandler,
    asyncHandler(async (req, res, next) => {
        const { name, email, phone, address } = req.body;

        const createdRestaurant = await Restaurant.findOne({ where: { vendorUserId: req.vendorUser.id, } });

        // Owner can only create 1 restaurant
        if (createdRestaurant && req.vendorUser.role !== 'admin') {
            return next(new ErrorResponse(`This owner id ${req.vendorUser.id} had already created the restaurant`, 400));
        }

        if (!req.files) {
            return next(new ErrorResponse('File cannot be empty', 400));
        }

        const restaurantImageFile = req.files.restaurantImage;

        if (!restaurantImageFile.mimetype.startsWith('image')) {
            return next(new ErrorResponse('File must be an image', 400));
        }

        if (restaurantImageFile.size > process.env.FILE_SIZE) {
            return next(new ErrorResponse(`File size cannot exceed with 1MB`, 400));
        }

        restaurantImageFile.name = `restaurant_img_${req.vendorUser.id}${path.extname(restaurantImageFile.name)}`;

        const uploadPath = './temp/restaurants/' + restaurantImageFile.name;

        restaurantImageFile.mv(uploadPath, async (err) => {
            if (err) {
                console.error(err);
                return next(new ErrorResponse('Upload Failed', 500));
            }
        });

        const storageFilename = await uploadImageToStorage(uploadPath, 'restaurants/' + restaurantImageFile.name);

        await sequelize.transaction(async (t) => {
            const restaurant = await Restaurant.create({
                name,
                email,
                phone,
                address,
                restaurantImage: storageFilename,
                vendorUserId: req.vendorUser.id,
            }, {
                transaction: t,
            });

            res.status(201).json({
                data: {
                    restaurant: restaurant,
                },
                success: true,
                message: 'Created restaurant successfully',
            });
        });

    }),
];

exports.updateRestaurant = [
    body('name').notEmpty(),
    body('email').notEmpty().isEmail().normalizeEmail(),
    body('phone').notEmpty().isMobilePhone(['ms-MY'], { strictMode: true, }).withMessage('Only accept mobile phone number'),
    body('address').notEmpty(),
    validationErrorHandler,
    asyncHandler(async (req, res, next) => {
        await sequelize.transaction(async (t) => {
            const { name, email, phone, address } = req.body;

            const restaurant = await Restaurant.findByPk(req.params.id, {
                transaction: t,
            });

            if (!restaurant) {
                return next(new ErrorResponse(`Restaurant not found with id of ${req.params.id}`, 404));
            }

            if (restaurant.vendorUserId !== req.vendorUser.id) {
                return next(new ErrorResponse(
                    `Vendor user ${req.vendorUser.id} does not have authorized to update this restaurant`,
                    404
                ));
            }

            if (!req.files) {
                return next(new ErrorResponse('File cannot be empty', 400));
            }

            const restaurantImageFile = req.files.restaurantImage;

            if (!restaurantImageFile.mimetype.startsWith('image')) {
                return next(new ErrorResponse('File must be an image', 400));
            }

            if (restaurantImageFile.size > process.env.FILE_SIZE) {
                return next(new ErrorResponse(`File size cannot exceed with 1MB`, 400));
            }

            restaurantImageFile.name = `restaurant_img_${req.vendorUser.id}${path.extname(restaurantImageFile.name)}`;

            const uploadPath = './temp/restaurants/' + restaurantImageFile.name;

            restaurantImageFile.mv(uploadPath, (err) => {
                if (err) {
                    console.error(err);
                    return next(new ErrorResponse('Upload Failed', 500));
                }
            });

            const storageFilename = await uploadImageToStorage(uploadPath, 'restaurants/' + restaurantImageFile.name);

            await restaurant.update({
                name,
                email,
                phone,
                address,
                restaurantImage: storageFilename,
            });

            await restaurant.save();

            res.status(200).json({
                data: {
                    restaurant,
                },
                success: true,
                message: 'Updated restaurant successfully',
            });
        });
    })
];

exports.deleteRestaurant = asyncHandler(async (req, res, next) => {
    await sequelize.transaction(async (t) => {

        const restaurant = await Restaurant.findByPk(req.params.id, {
            transaction: t,
        });

        if (!restaurant) {
            return next(new ErrorResponse(`Restaurant not found with id of ${req.params.id}`, 404));
        }

        if (restaurant.vendorUserId !== req.vendorUser.id) {
            return next(new ErrorResponse(
                `Vendor user ${req.vendorUser.id} does not have authorized to delete this restaurant`,
                404
            ));
        }

        await restaurant.destroy();

        res.status(200).json({
            success: true,
            message: 'Removed restaurant successfully',
        });
    });
});
const path = require('path');
const { unlink } = require('fs');
const { body } = require("express-validator");

const { asyncHandler, validationErrorHandler } = require("../middlewares");
const { RestaurantFood, sequelize } = require('../models');
const { ErrorResponse } = require("../utils");
const { uploadImageToStorage, deleteImage } = require('../config/firebase');

exports.getFoods = asyncHandler(async (req, res, next) => {

    const { limit, offset } = req.query;

    const foods = await RestaurantFood.findAndCountAll({
        where: {
            restaurantId: req.restaurant.id,
        },
        limit,
        offset,
    });

    res.status(200).json({
        data: {
            foods,
        },
        success: true,
    });
});

exports.showFood = asyncHandler(async (req, res, next) => {

    const food = await RestaurantFood.findByPk(req.params.id);

    if (!food) {
        return next(new ErrorResponse(`Food not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        data: {
            food,
        },
        succes: true,
    });


});

exports.createFood = [
    body('name').notEmpty(),
    body('price').notEmpty(),
    body('description').optional(),
    validationErrorHandler,
    asyncHandler(async (req, res, next) => {
        await sequelize.transaction(async (t) => {
            const { name, price, description, } = req.body;

            if (!req.files) {
                return next(new ErrorResponse('File cannot be empty', 400));
            }

            const foodImageFile = req.files.foodImage;

            if (!foodImageFile.mimetype.startsWith('image')) {
                return next(new ErrorResponse('File must be an image', 400));
            }

            if (foodImageFile.size > process.env.FILE_SIZE) {
                return next(new ErrorResponse(`File size cannot exceed with 1MB`, 400));
            }

            foodImageFile.name =
                `restaurant_${req.restaurant.id}_${foodImageFile.name.split('.')[0]}${path.extname(foodImageFile.name)}`;

            const uploadPath = './temp/foods/' + foodImageFile.name;

            foodImageFile.mv(uploadPath, async (err) => {
                if (err) {
                    console.error(err);
                    return next(new ErrorResponse('Upload Failed', 500));
                }
            });

            const storageFilename = await uploadImageToStorage(uploadPath, 'foods/' + foodImageFile.name);

            const food = await RestaurantFood.create({
                name,
                price,
                description,
                foodImage: storageFilename,
                restaurantId: req.restaurant.id,
            }, {
                transaction: t,
            });

            res.status(201).json({
                data: {
                    food,
                },
                succes: true,
                message: 'Created Food Successful',
            });
        });
    })
];

exports.updateFood = [
    body('name').notEmpty(),
    body('price').notEmpty(),
    body('description').optional(),
    validationErrorHandler,
    asyncHandler(async (req, res, next) => {

        const { name, price, description, } = req.body;

        await sequelize.transaction(async (t) => {
            const food = await RestaurantFood.findByPk(req.params.id, { transaction: t });

            if (!food) {
                return next(new ErrorResponse(`Food not found with id of ${req.params.id}`, 404));
            }

            if (!req.files) {
                return next(new ErrorResponse('File cannot be empty', 400));
            }

            const foodImageFile = req.files.foodImage;

            if (!foodImageFile.mimetype.startsWith('image')) {
                return next(new ErrorResponse('File must be an image', 400));
            }

            if (foodImageFile.size > process.env.FILE_SIZE) {
                return next(new ErrorResponse(`File size cannot exceed with 1MB`, 400));
            }

            foodImageFile.name =
                `restaurant_${req.restaurant.id}_${foodImageFile.name.split('.')[0]}${path.extname(foodImageFile.name)}`;

            const uploadPath = './temp/foods/' + foodImageFile.name;

            let storageFilename = food.foodImage;
            foodImageFile.mv(uploadPath, async (err) => {
                if (err) {
                    console.error(err);
                    return next(new ErrorResponse('Upload Failed', 500));
                }
            });

            if (food.foodImage.split('/')[1] !== foodImageFile.name) {

                unlink(uploadPath, (err) => {
                    if (err) {
                        console.error(err);
                        return next(new ErrorResponse('Removed File Failed', 500));
                    }
                });

                await deleteImage(food.foodImage);

                storageFilename = await uploadImageToStorage(uploadPath, 'foods/' + foodImageFile.name);
            }

            await food.update({
                name,
                price,
                description,
                foodImage: storageFilename,
            }, {
                transaction: t,
            });

            await food.save();

            res.status(200).json({
                data: {
                    food,
                },
                success: true,
                message: 'Updated food successfully',
            });
        });

    })
];

exports.deleteFood = [
    validationErrorHandler,
    asyncHandler(async (req, res, next) => {

        await sequelize.transaction(async (t) => {
            const food = await RestaurantFood.findByPk(req.params.id, { transaction: t });

            if (!food) {
                return next(new ErrorResponse(`Food not found with id of ${req.params.id}`, 404));
            }

            await food.destroy({ transaction: t, });

            res.status(200).json({
                success: true,
                message: 'Removed food successfully',
            });
        });

    })
];
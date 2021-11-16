const { body } = require("express-validator");

const { sequelize, VendorUser, } = require('../models');
const { asyncHandler, validationErrorHandler } = require("../middlewares");
const { ErrorResponse } = require("../utils");

// Create token from model, create cookie and send response
const sendTokenResponse = (vendorUser, statusCode, res) => {
    const token = vendorUser.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token,
        });
}

exports.register = [
    body('name').notEmpty(),
    body('email').notEmpty().isEmail().normalizeEmail(),
    body('password').notEmpty().isLength({ min: 6, }),
    body('role').optional().isIn(['admin', 'owner', 'user']).withMessage('Role can only be admin, owner or user'),
    body('profileImage').optional(),
    validationErrorHandler,
    asyncHandler(async (req, res, next) => {
        const { name, email, password, role, profileImage, } = req.body;

        await sequelize.transaction(async (t) => {
            const vendorUser = await VendorUser.create({
                name,
                email,
                password,
                role,
                profileImage,
            }, { transaction: t, });

            sendTokenResponse(vendorUser, 201, res);
        });
    }),
];

exports.login = [
    body('email').notEmpty().isEmail().normalizeEmail(),
    body('password').notEmpty(),
    validationErrorHandler,
    asyncHandler(async (req, res, next) => {
        const { email, password, } = req.body;


        // Check for user
        const vendorUser = await VendorUser.findOne({
            where: {
                email,
            },
        });

        // console.log(vendorUser);

        if (!vendorUser) {
            return next(new ErrorResponse('Invalid credentials', 401));
        }

        // Validate password
        const isMatch = await vendorUser.matchPassword(password);

        if (!isMatch) {
            return next(new ErrorResponse('Invalid credentials', 401));
        }

        sendTokenResponse(vendorUser, 200, res);

    }),
];

exports.logout = asyncHandler(async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        message: 'Logout Successfully'
    });

});

exports.getMe = asyncHandler(async (req, res, next) => {

    const user = await VendorUser.findByPk(req.vendorUser.id, {
        attributes: {
            exclude: ['password']
        },
    });

    res.status(200).json({
        data: {
            user,
        },
        success: true,
    });

});
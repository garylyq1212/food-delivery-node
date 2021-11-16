const { validationResult } = require('express-validator');

const { ErrorResponse } = require('../utils');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };

    error.message = err.message;

    console.error(err.stack);
    // console.log(err);

    if (err.name === 'SequelizeDatabaseError') {
        error = new ErrorResponse(err.message, 404);
    }

    if (err.message === 'Validation error') {
        const msg = Object.values(err.errors).map(val => val.message);
        error = new ErrorResponse(msg, 404);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Server Error',
    });
}

const validationErrorHandler = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json({
            success: false,
            message: errors.array(),
        });
    }

    return next();
}


module.exports = { errorHandler, validationErrorHandler };
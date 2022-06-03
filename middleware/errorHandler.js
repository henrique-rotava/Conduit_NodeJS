const { APIError } = require('../utils/error');

//REQUESTED PAGE IS NOT FOUND
module.exports.notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

//ERROR HANDLER
module.exports.errorHandler = (err, req, res, next) => {
    const stack = process.env.NODE_ENV === 'development' ? err.stack : undefined;
    if (err instanceof APIError) {
        return res.status(err.code).json({ error: { message: err.message, stack } });
    }

    return res.status(500).json({ error: { message: 'Internal server error', stack } });
};

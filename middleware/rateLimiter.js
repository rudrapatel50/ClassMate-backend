const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, //max of 100 requests per 15 minutes
    message: 'Too many attempts, please try again later'
});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000, //max of 1000 requests per 15 minutes
    message: 'Too many requests, please try again later'
});

module.exports = {
    authLimiter,
    apiLimiter
}; 
const rateLimit = require('express-rate-limit');

const msg = (m) => ({ success: false, message: m });

exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 200,
  message: msg('Too many requests. Try again after 15 minutes.'),
});

exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  message: msg('Too many login attempts. Try again after 15 minutes.'),
});

exports.bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 5,
  message: msg('Too many booking requests. Try again after 1 hour.'),
});

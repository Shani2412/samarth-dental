const { body, validationResult } = require('express-validator');
const { error } = require('../utils/response');

const validate = (req, res, next) => {
  const errs = validationResult(req);
  if (!errs.isEmpty())
    return error(res, 'Validation failed', 422, errs.array().map(e => ({ field: e.path, message: e.msg })));
  next();
};

const signupRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 60 }),
  body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginRules = [
  body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const appointmentRules = [
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('service').trim().notEmpty().withMessage('Service is required'),
  body('date').optional().isDate().withMessage('Valid date required'),
];

const reviewRules = [
  body('stars').isInt({ min: 1, max: 5 }).withMessage('Stars must be 1–5'),
  body('text').trim().notEmpty().isLength({ min: 10 }).withMessage('Review must be at least 10 characters'),
];

module.exports = { validate, signupRules, loginRules, appointmentRules, reviewRules };

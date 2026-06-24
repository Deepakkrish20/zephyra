import { body, validationResult } from 'express-validator';

/**
 * Validation rules for registration endpoint
 */
export const registerValidationRules = [
  body('name').notEmpty().withMessage('Name field is required.'),
  body('email').isEmail().withMessage('Provide a valid email address.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
];

/**
 * Validator runner middleware
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  
  return res.status(400).json({
    success: false,
    errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
  });
};

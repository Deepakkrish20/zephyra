import { body, validationResult } from 'express-validator';
import ROLES from '../constants/roles.js';

/**
 * Validation rules for registration endpoint
 */
export const registerValidationRules = [
  body('name').notEmpty().withMessage('Name field is required.'),
  body('email').isEmail().withMessage('Provide a valid email address.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  body('role')
    .notEmpty()
    .withMessage('Role field is required.')
    .isIn(Object.values(ROLES))
    .withMessage(`Role must be one of: ${Object.values(ROLES).join(', ')}`),
];

/**
 * Validation rules for login endpoint
 */
export const loginValidationRules = [
  body('email').isEmail().withMessage('Provide a valid email address.'),
  body('password').notEmpty().withMessage('Password field is required.'),
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
    errors: errors.array().map((err) => ({ field: err.path, message: err.msg })),
  });
};

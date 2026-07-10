import { body } from 'express-validator';

const register = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 40 })
    .withMessage('Username must be 3-40 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
];

const login = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export default { register, login };

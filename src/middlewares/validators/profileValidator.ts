import { body } from 'express-validator';

export const validateCreateProfile = [
  body('name')
    .isString()
    .withMessage('Name must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
];

export const validateUpdateProfile = [
  body('name')
    .isString()
    .withMessage('Name must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
];

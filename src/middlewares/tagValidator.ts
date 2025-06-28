import { body } from 'express-validator';

export const validateCreateTag = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .bail()
    .isString()
    .withMessage('Name must be a string'),
];

export const validateUpdateTag = [
  body('name')
    .optional()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .bail()
    .isString()
    .withMessage('Name must be a string'),
];

import { body } from 'express-validator';

export const validateCreateDepartment = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .bail()
    .isString()
    .withMessage('Name must be a string'),
  body('managerId')
    .notEmpty()
    .withMessage('Manager ID is required')
    .bail()
    .isNumeric()
    .withMessage('Manager ID must be a numeric value'),
];
export const validateUpdateDepartment = [
  body('name')
    .optional()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .bail()
    .isString()
    .withMessage('Name must be a string'),
  body('managerId')
    .optional()
    .isNumeric()
    .withMessage('Manager ID must be a numeric value'),
];

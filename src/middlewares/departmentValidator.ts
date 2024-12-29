import { body } from 'express-validator';

export const validateCreateDepartment = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .bail()
    .isString()
    .withMessage('Name must be a string'),
  body('manager_id')
    .optional()
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
  body('manager_id')
    .optional()
    .isNumeric()
    .withMessage('Manager ID must be a numeric value'),
];

import { body } from 'express-validator';

export const validateCreateTaskHistory = [
  body('taskId')
    .notEmpty()
    .withMessage('Task ID is required')
    .bail()
    .isNumeric()
    .withMessage('Task ID must be a numeric value'),
  body('changedById')
    .notEmpty()
    .withMessage('Changer ID is required')
    .bail()
    .isNumeric()
    .withMessage('Changer ID must be a numeric value'),
  body('field')
    .notEmpty()
    .withMessage('Field is required')
    .bail()
    .isString()
    .withMessage('Field must be a string'),
  body('oldValue')
    .notEmpty()
    .withMessage('Old value is required')
    .bail()
    .isString()
    .withMessage('Old value must be a string'),
  body('newValue')
    .notEmpty()
    .withMessage('New value is required')
    .bail()
    .isString()
    .withMessage('New value must be a string'),
];

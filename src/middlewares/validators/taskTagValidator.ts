import { body } from 'express-validator';

export const validateTaskTag = [
  body('taskId')
    .notEmpty()
    .withMessage('Task ID is required')
    .bail()
    .isNumeric()
    .withMessage('Task ID must be a numeric value'),
  body('tagId')
    .notEmpty()
    .withMessage('Tag ID is required')
    .bail()
    .isNumeric()
    .withMessage('Tag ID must be a numeric value'),
];

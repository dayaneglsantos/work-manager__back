import { body } from 'express-validator';

export const validateCreateTask = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .bail()
    .isString()
    .withMessage('Title must be a string'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string'),
  body('status')
    .optional()
    .isIn(['todo', 'inProgress', 'done', 'paused'])
    .withMessage('Status must be one of: pending, in-progress, completed'),
  body('deadline')
    .optional()
    .isISO8601()
    .withMessage('Deadline must be a valid date in ISO 8601 format'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be one of: low, medium, high'),
];

export const validateUpdateTask = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .bail()
    .isString()
    .withMessage('Title must be a string'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string'),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage('Status must be one of: pending, in-progress, completed'),
  body('deadline')
    .optional()
    .isISO8601()
    .withMessage('Deadline must be a valid date in ISO 8601 format'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be one of: low, medium, high'),
];

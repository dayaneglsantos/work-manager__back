import { body } from 'express-validator';
import { isValidDateOnly } from '../../utils/dateOnly';

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
    .optional({ nullable: true })
    .custom(isValidDateOnly)
    .withMessage('Deadline must be a valid date in YYYY-MM-DD format'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be one of: low, medium, high'),
];

export const validateUpdateTask = [
  body('title').optional().isString().withMessage('Title must be a string'),
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string'),
  body('status')
    .optional()
    .isIn(['todo', 'inProgress', 'done', 'paused'])
    .withMessage('Status must be one of: todo, inProgress, done, paused'),
  body('deadline')
    .optional({ nullable: true })
    .custom(isValidDateOnly)
    .withMessage('Deadline must be a valid date in YYYY-MM-DD format'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be one of: low, medium, high'),
  body('assigneeId')
    .optional({ nullable: true })
    .isInt()
    .withMessage('Assignee ID must be an integer'),
  body('departmentId')
    .optional({ nullable: true })
    .isInt()
    .withMessage('Department ID must be an integer'),
  body('tagsId')
    .optional({ nullable: true })
    .isArray()
    .withMessage('Tags ID must be an array of integers'),
];

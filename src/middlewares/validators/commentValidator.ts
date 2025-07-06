import { body } from 'express-validator';

export const validateCreateComment = [
  body('content')
    .notEmpty()
    .withMessage('Content is required')
    .bail()
    .isString()
    .withMessage('Content must be a string'),
  body('referenceId')
    .notEmpty()
    .withMessage('Reference ID is required')
    .bail()
    .isNumeric()
    .withMessage('Reference ID must be a numeric value'),
  body('referenceType')
    .notEmpty()
    .withMessage('Reference type is required')
    .bail()
    .isIn(['task']) // Ajustar opções conforme necessário
    .withMessage('Reference type must be one of the following: task'),
  body('parentCommentId')
    .optional()
    .isNumeric()
    .withMessage('Parent comment ID must be a numeric value'),
  body('edited')
    .optional()
    .isBoolean()
    .withMessage('Edited must be a boolean value'),
];

export const validateUpdateComment = [
  body('content')
    .notEmpty()
    .withMessage('Content is required')
    .bail()
    .isString()
    .withMessage('Content must be a string'),
];

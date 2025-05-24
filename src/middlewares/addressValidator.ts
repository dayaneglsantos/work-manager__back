import { body, param } from 'express-validator';

export const validateEditAddress = [
  param('id').isNumeric().withMessage('User ID must be a numeric value'),
  body('zip_code')
    .optional()
    .isString()
    .withMessage('Zip code must be a string'),
  body('state').optional().isString().withMessage('State must be a string'),
  body('city').optional().isString().withMessage('City must be a string'),
  body('street').optional().isString().withMessage('Street must be a string'),
  body('number')
    .optional()
    .isNumeric()
    .withMessage('Number must be a numeric value'),
  body('complement')
    .optional()
    .isString()
    .withMessage('Complement must be a string'),
];

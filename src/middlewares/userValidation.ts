import { body, param } from 'express-validator';

export const validateCreateUser = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .bail()
    .isString()
    .withMessage('Name must be a string'),
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .bail()
    .isEmail()
    .withMessage('Invalid email format'),
  body('phone_number')
    .isString()
    .notEmpty()
    .withMessage('Phone number is required'),
  body('emergency_contact').optional().isString(),
  body('birthday').optional().isString(),
  body('profile_img').optional().isString(),
  body('password').isString().notEmpty().withMessage('Password is required'),
  body('profile_id')
    .notEmpty()
    .withMessage('Profile ID is required')
    .bail()
    .isNumeric()
    .withMessage('Profile ID must be a numeric value'),
  body('supervisor_id').optional().isNumeric(),
  body('department_id').optional().isNumeric(),
  body('current_salary').optional().isNumeric(),
  body('admission_date').optional().isString(),
];

export const validateUpdateUser = [
  param('id').isNumeric().withMessage('User ID must be a numeric value'),
  body('name')
    .optional()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .bail()
    .isString()
    .withMessage('Name must be a string'),
  body('email')
    .optional()
    .notEmpty()
    .withMessage('Email cannot be empty')
    .bail()
    .isEmail()
    .withMessage('Invalid email format'),
  body('phone_number')
    .optional()
    .notEmpty()
    .withMessage('Phone number cannot be empty')
    .bail()
    .isString()
    .withMessage('Phone number must be a string'),
  body('emergency_contact')
    .optional()
    .isString()
    .withMessage('Emergency contact must be a string'),
  body('birthday')
    .optional()
    .isString()
    .withMessage('Birthday must be a valid string'),
  body('profile_img')
    .optional()
    .isString()
    .withMessage('Profile image must be a valid URL'),
  body('password')
    .optional()
    .notEmpty()
    .withMessage('Password cannot be empty')
    .bail()
    .isString()
    .withMessage('Password must be a string'),
  body('profile_id')
    .optional()
    .notEmpty()
    .withMessage('Profile ID cannot be empty')
    .bail()
    .isNumeric()
    .withMessage('Profile ID must be a numeric value'),
  body('supervisor_id')
    .optional()
    .isNumeric()
    .withMessage('Supervisor ID must be a numeric value'),
  body('department_id')
    .optional()
    .isNumeric()
    .withMessage('Department ID must be a numeric value'),
  body('current_salary')
    .optional()
    .isNumeric()
    .withMessage('Current salary must be a numeric value'),
  body('admission_date')
    .optional()
    .isString()
    .withMessage('Admission date must be a valid string'),
  body('address')
    .optional()
    .isObject()
    .withMessage('Address must be an object'),
];

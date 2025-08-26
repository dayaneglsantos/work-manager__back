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
  body('phoneNumber')
    .isString()
    .notEmpty()
    .withMessage('Phone number is required'),
  body('birthDate').optional().isString(),
  body('profileImage').optional().isString(),
  body('password').isString().notEmpty().withMessage('Password is required'),
  body('profileId')
    .notEmpty()
    .withMessage('Profile ID is required')
    .bail()
    .isNumeric()
    .withMessage('Profile ID must be a numeric value'),
  body('supervisorId').optional().isNumeric(),
  body('departmentId').optional().isNumeric(),
  body('currentSalary')
    .notEmpty()
    .isNumeric()
    .withMessage('Current salary is required'),
  body('admissionDate')
    .notEmpty()
    .isString()
    .withMessage('Admission date is required'),
  body('currentPosition')
    .notEmpty()
    .isString()
    .withMessage('Current position is required'),
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
  body('phoneNumber')
    .optional()
    .notEmpty()
    .withMessage('Phone number cannot be empty')
    .bail()
    .isString()
    .withMessage('Phone number must be a string'),
  body('birthDate')
    .optional()
    .isString()
    .withMessage('Birth date must be a valid string'),
  body('profileImage')
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
  body('profileId')
    .optional()
    .notEmpty()
    .withMessage('Profile ID cannot be empty')
    .bail()
    .isNumeric()
    .withMessage('Profile ID must be a numeric value'),
  body('supervisorId')
    .optional({ nullable: true })
    .isNumeric()
    .withMessage('Supervisor ID must be a numeric value'),
  body('departmentId')
    .optional({ nullable: true })
    .isNumeric()
    .withMessage('Department ID must be a numeric value'),
  body('currentSalary')
    .optional({ nullable: true })
    .isNumeric()
    .withMessage('Current salary must be a numeric value'),
  body('admissionDate')
    .optional()
    .isString()
    .withMessage('Admission date must be a valid string'),
  body('address')
    .optional()
    .isObject()
    .withMessage('Address must be an object'),
];

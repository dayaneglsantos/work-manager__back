import { body, param, query } from 'express-validator';
import { isValidDateOnly } from '../../utils/dateOnly';
import { isValidCpf, normalizeCpf } from '../../utils/cpf';

const employmentStatuses = ['active', 'inactive', 'terminated', 'resigned'];

export const validateUserId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
];

const validateOptionalAddress = [
  body('address')
    .optional()
    .isObject()
    .withMessage('Address must be an object'),
  body('address.zipCode')
    .if(body('address').exists())
    .notEmpty()
    .withMessage('Zip code is required')
    .bail()
    .isString()
    .withMessage('Zip code must be a string'),
  body('address.state')
    .if(body('address').exists())
    .notEmpty()
    .withMessage('State is required')
    .bail()
    .isString()
    .withMessage('State must be a string'),
  body('address.city')
    .if(body('address').exists())
    .notEmpty()
    .withMessage('City is required')
    .bail()
    .isString()
    .withMessage('City must be a string'),
  body('address.street')
    .if(body('address').exists())
    .notEmpty()
    .withMessage('Street is required')
    .bail()
    .isString()
    .withMessage('Street must be a string'),
  body('address.number')
    .if(body('address').exists())
    .notEmpty()
    .withMessage('Address number is required')
    .bail()
    .isNumeric()
    .withMessage('Address number must be numeric'),
  body('address.complement')
    .optional({ nullable: true })
    .isString()
    .withMessage('Address complement must be a string'),
];

export const validateGetUsers = [
  query('employmentStatus')
    .optional()
    .isIn(employmentStatuses)
    .withMessage('Invalid employment status'),
];

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
  body('cpf')
    .customSanitizer(normalizeCpf)
    .notEmpty()
    .withMessage('CPF is required')
    .bail()
    .custom(isValidCpf)
    .withMessage('CPF must be valid'),
  body('phoneNumber')
    .isString()
    .notEmpty()
    .withMessage('Phone number is required'),
  body('birthDate')
    .optional()
    .custom(isValidDateOnly)
    .withMessage('Birth date must be a valid date in YYYY-MM-DD format'),
  body('profileId')
    .notEmpty()
    .withMessage('Profile ID is required')
    .bail()
    .isNumeric()
    .withMessage('Profile ID must be a numeric value'),
  body('supervisorId').optional({ nullable: true }).isNumeric(),
  body('departmentId').optional({ nullable: true }).isNumeric(),
  body('currentSalary')
    .notEmpty()
    .isNumeric()
    .withMessage('Current salary is required'),
  body('admissionDate')
    .notEmpty()
    .withMessage('Admission date is required')
    .bail()
    .custom(isValidDateOnly)
    .withMessage('Admission date must be a valid date in YYYY-MM-DD format'),
  body('currentPosition')
    .notEmpty()
    .isString()
    .withMessage('Current position is required'),
  body('employmentStatus')
    .optional()
    .isIn(employmentStatuses)
    .withMessage('Invalid employment status'),
  body('statusReason')
    .optional({ nullable: true })
    .isString()
    .withMessage('Status reason must be a string')
    .bail()
    .trim()
    .isLength({ max: 191 })
    .withMessage('Status reason must have at most 191 characters'),
  body('statusReason')
    .if(body('employmentStatus').equals('inactive'))
    .trim()
    .notEmpty()
    .withMessage('Status reason is required for inactive users'),
  ...validateOptionalAddress,
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
  body('cpf')
    .optional()
    .customSanitizer(normalizeCpf)
    .custom(isValidCpf)
    .withMessage('CPF must be valid'),
  body('phoneNumber')
    .optional()
    .notEmpty()
    .withMessage('Phone number cannot be empty')
    .bail()
    .isString()
    .withMessage('Phone number must be a string'),
  body('birthDate')
    .optional()
    .custom(isValidDateOnly)
    .withMessage('Birth date must be a valid date in YYYY-MM-DD format'),
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
    .custom(isValidDateOnly)
    .withMessage('Admission date must be a valid date in YYYY-MM-DD format'),
  body('employmentStatus')
    .optional()
    .isIn(employmentStatuses)
    .withMessage('Invalid employment status'),
  body('statusReason')
    .optional({ nullable: true })
    .isString()
    .withMessage('Status reason must be a string')
    .bail()
    .trim()
    .isLength({ max: 191 })
    .withMessage('Status reason must have at most 191 characters'),
  ...validateOptionalAddress,
];

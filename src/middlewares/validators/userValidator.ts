import { body, param, query } from 'express-validator';
import { isValidDateOnly } from '../../utils/dateOnly';
import { isValidCpf, normalizeCpf } from '../../utils/cpf';

const employmentStatuses = ['active', 'inactive', 'terminated', 'resigned'];

const normalizeDigits = (value: unknown): unknown =>
  typeof value === 'string' ? value.replace(/\D/g, '') : value;

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
    .customSanitizer(normalizeDigits)
    .notEmpty()
    .withMessage('Zip code is required')
    .bail()
    .isString()
    .withMessage('Zip code must be a string')
    .bail()
    .matches(/^\d{8}$/)
    .withMessage('Zip code must have exactly 8 digits'),
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

export const validateGetUserOptions = [
  query('search')
    .isString()
    .withMessage('Search must be a string')
    .bail()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Search must contain between 3 and 100 characters'),
  query('employmentStatus')
    .optional()
    .isIn(employmentStatuses)
    .withMessage('Invalid employment status'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  query('pageSize')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Page size must contain between 1 and 50 items')
    .toInt(),
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
    .customSanitizer(normalizeDigits)
    .isString()
    .withMessage('Phone number must be a string')
    .bail()
    .notEmpty()
    .withMessage('Phone number is required')
    .bail()
    .matches(/^\d{10,11}$/)
    .withMessage('Phone number must have 10 or 11 digits'),
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
    .customSanitizer(normalizeDigits)
    .notEmpty()
    .withMessage('Phone number cannot be empty')
    .bail()
    .isString()
    .withMessage('Phone number must be a string')
    .bail()
    .matches(/^\d{10,11}$/)
    .withMessage('Phone number must have 10 or 11 digits'),
  body('birthDate')
    .optional()
    .custom(isValidDateOnly)
    .withMessage('Birth date must be a valid date in YYYY-MM-DD format'),
  body('password')
    .not()
    .exists()
    .withMessage(
      'Password cannot be changed through the generic user update endpoint'
    ),
  body('profileId')
    .optional()
    .notEmpty()
    .withMessage('Profile ID cannot be empty')
    .bail()
    .isNumeric()
    .withMessage('Profile ID must be a numeric value'),
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

import { body } from 'express-validator';

const allowedFields = new Set([
  'name',
  'phoneNumber',
  'address',
  'currentPassword',
  'newPassword',
  'confirmPassword',
]);

const normalizeDigits = (value: unknown): unknown =>
  typeof value === 'string' ? value.replace(/\D/g, '') : value;

export const validateUpdateSelfProfile = [
  body().custom((value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error('Request body must be an object');
    }

    const unsupportedFields = Object.keys(value).filter(
      (field) => !allowedFields.has(field)
    );

    if (unsupportedFields.length > 0) {
      throw new Error(
        `Fields cannot be changed through self-service: ${unsupportedFields.join(', ')}`
      );
    }

    if (Object.keys(value).length === 0) {
      throw new Error('No fields to update');
    }

    const passwordFields = [
      value.currentPassword,
      value.newPassword,
      value.confirmPassword,
    ];
    const isChangingPassword = passwordFields.some(
      (field) => field !== undefined
    );

    if (
      isChangingPassword &&
      passwordFields.some((field) => typeof field !== 'string' || !field)
    ) {
      throw new Error(
        'Current password, new password and confirmation are required'
      );
    }

    if (isChangingPassword && value.newPassword !== value.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    return true;
  }),
  body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty'),
  body('phoneNumber')
    .optional()
    .customSanitizer(normalizeDigits)
    .isString()
    .withMessage('Phone number must be a string')
    .bail()
    .matches(/^\d{10,11}$/)
    .withMessage('Phone number must have 10 or 11 digits'),
  body('address')
    .optional({ nullable: true })
    .isObject()
    .withMessage('Address must be an object'),
  body('address.zipCode')
    .if(body('address').exists({ values: 'falsy' }).notEmpty())
    .customSanitizer(normalizeDigits)
    .matches(/^\d{8}$/)
    .withMessage('Zip code must have exactly 8 digits'),
  body('address.state')
    .if(body('address').exists({ values: 'falsy' }).notEmpty())
    .isString()
    .withMessage('State must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('address.city')
    .if(body('address').exists({ values: 'falsy' }).notEmpty())
    .isString()
    .withMessage('City must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('address.street')
    .if(body('address').exists({ values: 'falsy' }).notEmpty())
    .isString()
    .withMessage('Street must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Street is required'),
  body('address.number')
    .if(body('address').exists({ values: 'falsy' }).notEmpty())
    .isNumeric()
    .withMessage('Address number must be numeric'),
  body('address.complement')
    .optional({ nullable: true })
    .isString()
    .withMessage('Address complement must be a string'),
  body('newPassword')
    .optional()
    .isLength({ min: 8 })
    .withMessage('New password must have at least eight characters'),
];

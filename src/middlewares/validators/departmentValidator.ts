import { body, param } from 'express-validator';

const validInteger = (value: unknown) =>
  typeof value === 'number' &&
  Number.isInteger(value) &&
  value > 0 &&
  value <= 2147483647;

const validatePayload = body().custom((value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Body must be an object');
  }
  const keys = Object.keys(value);
  if (
    !keys.length ||
    keys.some((key) => !['name', 'managerId'].includes(key))
  ) {
    throw new Error('Provide only name and managerId, with at least one field');
  }
  return true;
});

const nameValidator = () =>
  body('name')
    .isString()
    .withMessage('Name must be a string')
    .bail()
    .trim()
    .isLength({ min: 1, max: 191 })
    .withMessage('Name must contain between 1 and 191 characters');

export const validateDepartmentId = [
  param('id')
    .custom(
      (value: string) => /^[1-9]\d*$/.test(value) && validInteger(Number(value))
    )
    .withMessage('Department ID must be a positive integer'),
];
export const validateCreateDepartment = [
  validatePayload,
  nameValidator(),
  body('managerId')
    .custom(validInteger)
    .withMessage('Manager ID must be a positive integer'),
];
export const validateUpdateDepartment = [
  validatePayload,
  nameValidator().optional(),
  body('managerId')
    .optional()
    .custom(validInteger)
    .withMessage('Manager ID must be a positive integer'),
];

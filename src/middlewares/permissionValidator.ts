import { body } from 'express-validator';

// __________ Actions ___________

export const validateCreatePermissionAction = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .bail()
    .isString()
    .withMessage('Name must be a string'),
];

export const validateUpdatePermissionAction = [
  body('name')
    .optional()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .bail()
    .isString()
    .withMessage('Name must be a string'),
];

// __________ Types ___________

export const validateCreatePermissionType = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .bail()
    .isString()
    .withMessage('Name must be a string'),
];

export const validateUpdatePermissionType = [
  body('name')
    .optional()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .bail()
    .isString()
    .withMessage('Name must be a string'),
];

// __________ Permissions ___________
export const validateCreatePermission = [
  body('actionId')
    .notEmpty()
    .withMessage('Action ID is required')
    .bail()
    .isInt()
    .withMessage('Action ID must be an integer'),
  body('typeId')
    .notEmpty()
    .withMessage('Type ID is required')
    .bail()
    .isInt()
    .withMessage('Type ID must be an integer'),
];

export const validateUpdatePermission = [
  body('actionId')
    .optional()
    .isInt()
    .withMessage('Action ID must be an integer'),
  body('typeId').optional().isInt().withMessage('Type ID must be an integer'),
];

// __________ Profile Permissions ___________
export const validateCreateProfilePermission = [
  body('profileId')
    .notEmpty()
    .withMessage('Profile ID is required')
    .bail()
    .isInt()
    .withMessage('Profile ID must be an integer'),
  body('permissionId')
    .notEmpty()
    .withMessage('Permission ID is required')
    .bail()
    .isInt()
    .withMessage('Permission ID must be an integer'),
  body('hasPermission')
    .notEmpty()
    .withMessage('hasPermission is required')
    .isBoolean()
    .withMessage('hasPermission must be a boolean'),
];

export const validateUpdateProfilePermission = [
  body('hasPermission')
    .optional()
    .isBoolean()
    .withMessage('hasPermission must be a boolean'),
  body('profileId')
    .optional()
    .isInt()
    .withMessage('Profile ID must be an integer'),
  body('permissionId')
    .optional()
    .isInt()
    .withMessage('Permission ID must be an integer'),
];

// __________ Custom Permission ___________
export const validateCreateCustomPermission = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .bail()
    .isInt()
    .withMessage('User ID must be an integer'),
  body('permissionId')
    .notEmpty()
    .withMessage('Permission ID is required')
    .bail()
    .isInt()
    .withMessage('Permission ID must be an integer'),
  body('hasPermission')
    .notEmpty()
    .withMessage('hasPermission is required')
    .isBoolean()
    .withMessage('hasPermission must be a boolean'),
];

export const validateUpdateCustomPermission = [
  body('hasPermission')
    .optional()
    .isBoolean()
    .withMessage('hasPermission must be a boolean'),
  body('userId').optional().isInt().withMessage('User ID must be an integer'),
  body('permissionId')
    .optional()
    .isInt()
    .withMessage('Permission ID must be an integer'),
];

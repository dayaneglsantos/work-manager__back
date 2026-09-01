import { body, param } from 'express-validator';

const validatePermissionList = [
  body('permissions')
    .isArray({ min: 1 })
    .withMessage('Permissions must be a non-empty array')
    .bail()
    .custom((permissions: Array<{ permissionId?: number }>) => {
      const ids = permissions.map((permission) => permission.permissionId);

      if (new Set(ids).size !== ids.length) {
        throw new Error('Permission IDs must not be duplicated');
      }

      return true;
    }),
  body('permissions.*.permissionId')
    .isInt({ min: 1 })
    .withMessage('Permission ID must be a positive integer'),
];

export const validateProfilePermissionList = [
  param('profileId')
    .isInt({ min: 1 })
    .withMessage('Profile ID must be a positive integer'),
  ...validatePermissionList,
  body('permissions.*.hasPermission')
    .isBoolean()
    .withMessage('hasPermission must be a boolean'),
];

export const validateUserPermissionList = [
  param('userId')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
  ...validatePermissionList,
  body('permissions.*.customValue')
    .custom((value) => value === null || typeof value === 'boolean')
    .withMessage('customValue must be a boolean or null'),
];

export const validateProfilePermissionParams = [
  param('profileId')
    .isInt({ min: 1 })
    .withMessage('Profile ID must be a positive integer'),
];

export const validateUserPermissionParams = [
  param('userId')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
];

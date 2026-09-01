import express from 'express';

import { validationHandler } from '../middlewares/validationHandler';
import { authorizePermission } from '../middlewares/permissionAuthorization';
import {
  validateProfilePermissionList,
  validateProfilePermissionParams,
  validateUserPermissionList,
  validateUserPermissionParams,
} from '../middlewares/validators/permissionAssignmentValidator';
import { getAllPermissionTypes } from '../controllers/permissions/typesController';
import { getAllPermissionActions } from '../controllers/permissions/actionsController';
import { getAllPermissions } from '../controllers/permissions/permissionsController';
import {
  getProfilePermissionList,
  getUserPermissionList,
  updateProfilePermissionList,
  updateUserPermissionList,
} from '../controllers/permissions/assignmentController';

const router = express.Router();

// _________________________________ Permission Actions Routes _________________________________

router.get(
  '/permission_actions',
  authorizePermission('read-permissions'),
  getAllPermissionActions
);

// _________________________________ Permission Types Routes _________________________________

router.get(
  '/permission_types',
  authorizePermission('read-permissions'),
  getAllPermissionTypes
);

// _________________________________ Permission _________________________________
router.get(
  '/permissions',
  authorizePermission('read-permissions'),
  getAllPermissions
);

// _________________________________ Permission Checklists _________________________________
router.get(
  '/profiles/:profileId/permissions',
  validateProfilePermissionParams,
  validationHandler,
  authorizePermission('read-permissions'),
  getProfilePermissionList
);
router.put(
  '/profiles/:profileId/permissions',
  validateProfilePermissionList,
  validationHandler,
  authorizePermission('update-permissions'),
  updateProfilePermissionList
);
router.get(
  '/users/:userId/permissions',
  validateUserPermissionParams,
  validationHandler,
  authorizePermission('read-permissions'),
  getUserPermissionList
);
router.put(
  '/users/:userId/permissions',
  validateUserPermissionList,
  validationHandler,
  authorizePermission('update-permissions'),
  updateUserPermissionList
);

export default router;

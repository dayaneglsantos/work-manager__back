import express from 'express';

import {
  validateCreateCustomPermission,
  validateCreatePermission,
  validateCreatePermissionAction,
  validateCreateProfilePermission,
  validateUpdateCustomPermission,
  validateUpdatePermission,
  validateUpdatePermissionAction,
  validateUpdateProfilePermission,
} from '../middlewares/validators/permissionValidator';
import { validationHandler } from '../middlewares/validationHandler';
import {
  deletePermissionType,
  getAllPermissionTypes,
  updatePermissionType,
} from '../controllers/Permissions/typesController';
import {
  createPermissionAction,
  deletePermissionAction,
  getAllPermissionActions,
  updatePermissionAction,
} from '../controllers/Permissions/actionsController';
import {
  createProfilePermission,
  deleteProfilePermission,
  getAllProfilePermissions,
  updateProfilePermission,
} from '../controllers/Permissions/defaultController';
import {
  createPermission,
  deletePermission,
  editPermission,
  getAllPermissions,
} from '../controllers/Permissions/permissionsController';
import {
  createCustomPermission,
  deleteCustomPermission,
  getAllCustomPermissions,
  updateCustomPermission,
} from '../controllers/Permissions/customController';

const router = express.Router();

// _________________________________ Permission Actions Routes _________________________________

router.get('/permission_actions', getAllPermissionActions);
router.put(
  '/permission_actions/:id',
  validateUpdatePermissionAction,
  validationHandler,
  updatePermissionAction
);
router.post(
  '/permission_actions',
  validateCreatePermissionAction,
  validationHandler,
  createPermissionAction
);
router.delete('/permission_actions/:id', deletePermissionAction);

// _________________________________ Permission Types Routes _________________________________

router.get('/permission_types', getAllPermissionTypes);
router.put(
  '/permission_types/:id',
  validateUpdatePermissionAction,
  validationHandler,
  updatePermissionType
);
router.post(
  '/permission_types',
  validateCreatePermissionAction,
  validationHandler,
  updatePermissionType
);
router.delete('/permission_types/:id', deletePermissionType);

// _________________________________ Permission _________________________________
router.get('/permissions', getAllPermissions);
router.post(
  '/permissions',
  validateCreatePermission,
  validationHandler,
  createPermission
);
router.put(
  '/permissions/:id',
  validateUpdatePermission,
  validationHandler,
  editPermission
);
router.delete('/permissions/:id', deletePermission);

// _________________________________ Profile Permissions _________________________________
router.get('/profile_permissions', getAllProfilePermissions);
router.post(
  '/profile_permissions',
  validateCreateProfilePermission,
  validationHandler,
  createProfilePermission
);
router.put(
  '/profile_permissions/:id',
  validateUpdateProfilePermission,
  validationHandler,
  updateProfilePermission
);
router.delete('/profile_permissions/:id', deleteProfilePermission);

// _________________________________ Custom Permissions _________________________________
router.get('/custom_permissions', getAllCustomPermissions);
router.post(
  '/custom_permissions',
  validateCreateCustomPermission,
  validationHandler,
  createCustomPermission
);
router.put(
  '/custom_permissions/:id',
  validateUpdateCustomPermission,
  validationHandler,
  updateCustomPermission
);
router.delete('/custom_permissions/:id', deleteCustomPermission);

export default router;

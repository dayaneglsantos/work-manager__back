import express from 'express';
import {
  deletePermissionAction,
  deletePermissionType,
  getAllPermissionActions,
  getAllPermissionTypes,
  updatePermissionAction,
  updatePermissionType,
} from '../controllers/permissionController';
import {
  validateCreatePermissionAction,
  validateUpdatePermissionAction,
} from '../middlewares/permissionValidator';
import { validationHandler } from '../middlewares/validationHandler';

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
  updatePermissionAction
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

export default router;

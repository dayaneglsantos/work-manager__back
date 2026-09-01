import express from 'express';
import {
  createDepartment,
  getDepartment,
  partialUpdateDepartment,
  deleteDepartment,
  getAllDepartments,
  fullUpdateDepartment,
} from '../controllers/departmentController';
import {
  validateCreateDepartment,
  validateUpdateDepartment,
} from '../middlewares/validators/departmentValidator';
import { validationHandler } from '../middlewares/validationHandler';
import { authorizePermission } from '../middlewares/permissionAuthorization';

const router = express.Router();

router.get(
  '/departments/:id',
  authorizePermission('read-departments'),
  getDepartment
);
router.get(
  '/departments',
  authorizePermission('read-departments'),
  getAllDepartments
);
router.patch(
  '/departments/:id',
  validateUpdateDepartment,
  validationHandler,
  authorizePermission('update-departments'),
  partialUpdateDepartment
);
router.put(
  '/departments/:id',
  validateUpdateDepartment,
  validationHandler,
  authorizePermission('update-departments'),
  fullUpdateDepartment
);
router.post(
  '/departments',
  validateCreateDepartment,
  validationHandler,
  authorizePermission('create-departments'),
  createDepartment
);
router.delete(
  '/departments/:id',
  authorizePermission('delete-departments'),
  deleteDepartment
);

export default router;

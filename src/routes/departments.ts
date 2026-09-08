import express from 'express';
import {
  createDepartment,
  getDepartment,
  partialUpdateDepartment,
  deleteDepartment,
  getAllDepartments,
} from '../controllers/departmentController';
import {
  validateCreateDepartment,
  validateDepartmentId,
  validateUpdateDepartment,
} from '../middlewares/validators/departmentValidator';
import { validationHandler } from '../middlewares/validationHandler';
import { authorizePermission } from '../middlewares/permissionAuthorization';

const router = express.Router();

router.get(
  '/departments/:id',
  validateDepartmentId,
  validationHandler,
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
  validateDepartmentId,
  validateUpdateDepartment,
  validationHandler,
  authorizePermission('update-departments'),
  partialUpdateDepartment
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
  validateDepartmentId,
  validationHandler,
  authorizePermission('delete-departments'),
  deleteDepartment
);

export default router;

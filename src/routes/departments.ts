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

const router = express.Router();

router.get('/departments/:id', getDepartment);
router.get('/departments', getAllDepartments);
router.patch(
  '/departments/:id',
  validateUpdateDepartment,
  validationHandler,
  partialUpdateDepartment
);
router.put(
  '/departments/:id',
  validateUpdateDepartment,
  validationHandler,
  fullUpdateDepartment
);
router.post(
  '/departments',
  validateCreateDepartment,
  validationHandler,
  createDepartment
);
router.delete('/departments/:id', deleteDepartment);

export default router;

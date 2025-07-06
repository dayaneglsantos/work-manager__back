import express from 'express';
import {
  createDepartment,
  getDepartment,
  updateDepartment,
  deleteDepartment,
  getAllDepartments,
} from '../controllers/departmentController';
import {
  validateCreateDepartment,
  validateUpdateDepartment,
} from '../middlewares/validators/departmentValidator';
import { validationHandler } from '../middlewares/validationHandler';

const router = express.Router();

router.get('/departments/:id', getDepartment);
router.get('/departments', getAllDepartments);
router.put(
  '/departments/:id',
  validateUpdateDepartment,
  validationHandler,
  updateDepartment
);
router.post(
  '/departments',
  validateCreateDepartment,
  validationHandler,
  createDepartment
);
router.delete('/departments/:id', deleteDepartment);

export default router;

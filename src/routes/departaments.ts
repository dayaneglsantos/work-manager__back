import express from 'express';
import {
  createDepartament,
  getDepartament,
  updateDepartament,
  deleteDepartament,
  getAllDepartaments,
} from '../controllers/departamentController';
import {
  validateCreateDepartament,
  validateUpdateDepartament,
} from '../middlewares/departamentValidator';
import { validationHandler } from '../middlewares/validationHandler';

const router = express.Router();

router.get('/departaments/:id', getDepartament);
router.get('/departaments', getAllDepartaments);
router.put(
  '/departaments/:id',
  validateUpdateDepartament,
  validationHandler,
  updateDepartament
);
router.post(
  '/departaments',
  validateCreateDepartament,
  validationHandler,
  createDepartament
);
router.delete('/departaments/:id', deleteDepartament);

export default router;

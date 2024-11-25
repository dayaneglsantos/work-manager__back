import express from 'express';
import {
  createDepartament,
  getDepartament,
  updateDepartament,
  deleteDepartament,
  getAllDepartaments,
} from '../controllers/departamentController';

const router = express.Router();

router.get('/departaments/:id', getDepartament);
router.get('/departaments', getAllDepartaments);
router.put('/departaments/:id', updateDepartament);
router.post('/departaments', createDepartament);
router.delete('/departaments/:id', deleteDepartament);

export default router;

import express from 'express';
import {
  createDepartament,
  getDepartament,
  updateDepartament,
  deleteDepartament,
} from '../controllers/departamentController';

const router = express.Router();

router.post('/departaments', createDepartament);
router.get('/departaments/:id', getDepartament);
router.put('/departaments/:id', updateDepartament);
router.delete('/departaments/:id', deleteDepartament);

export default router;

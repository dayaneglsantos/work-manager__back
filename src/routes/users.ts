import express from 'express';
import {
  createUser,
  getUserById,
  getAllUses,
  updateUser,
  deleteUser,
} from '../controllers/userController';

const router = express.Router();

router.post('/users', createUser);
router.get('/users/:id', getUserById);
router.get('/users', getAllUses);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;

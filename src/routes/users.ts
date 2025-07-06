import express from 'express';
import {
  createUser,
  getUserById,
  getAllUses,
  updateUser,
  deleteUser,
} from '../controllers/userController';
import {
  validateCreateUser,
  validateUpdateUser,
} from '../middlewares/validators/userValidator';
import { validationHandler } from '../middlewares/validationHandler';

const router = express.Router();

router.post('/users', validateCreateUser, validationHandler, createUser);
router.get('/users/:id', getUserById);
router.get('/users', getAllUses);
router.put('/users/:id', validateUpdateUser, validationHandler, updateUser);
router.delete('/users/:id', deleteUser);

export default router;

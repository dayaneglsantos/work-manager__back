import express from 'express';
import {
  createUser,
  getUserById,
  getAllUsers,
  partialUpdateUser,
  deleteUser,
  fullUpdateUser,
} from '../controllers/userController';
import {
  validateCreateUser,
  validateGetUsers,
  validateUpdateUser,
} from '../middlewares/validators/userValidator';
import { validationHandler } from '../middlewares/validationHandler';

const router = express.Router();

router.post('/users', validateCreateUser, validationHandler, createUser);
router.get('/users/:id', getUserById);
router.get('/users', validateGetUsers, validationHandler, getAllUsers);
router.patch(
  '/users/:id',
  validateUpdateUser,
  validationHandler,
  partialUpdateUser
);
router.put('/users/:id', validateUpdateUser, validationHandler, fullUpdateUser);
router.delete('/users/:id', deleteUser);

export default router;

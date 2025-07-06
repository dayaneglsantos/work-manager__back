import express from 'express';
import { validationHandler } from '../middlewares/validationHandler';
import { validateCreateTaskHistory } from '../middlewares/validators/taskHistoryValidator';
import { createTaskHistory } from '../controllers/taskHistoryController';

const router = express.Router();

router.post(
  '/task_history',
  validateCreateTaskHistory,
  validationHandler,
  createTaskHistory
);
// router.get('/task_history/:id', getUserById);
// router.get('/task_history', getAllUses);
// router.put(
//   '/task_history/:id',
//   validateUpdateUser,
//   validationHandler,
//   updateUser
// );
// router.delete('/task_history/:id', deleteUser);

export default router;

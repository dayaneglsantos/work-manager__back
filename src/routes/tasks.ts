import express from 'express';
import {
  createTask,
  deleteTask,
  getAllTasks,
  getTaskById,
  fullUpdateTask,
  partialUpdateTask,
} from '../controllers/taskController';
import {
  validateCreateTask,
  validateUpdateTask,
} from '../middlewares/validators/taskValidator';
import { validationHandler } from '../middlewares/validationHandler';
import { authorizePermission } from '../middlewares/permissionAuthorization';

const router = express.Router();

router.get('/tasks/:id', authorizePermission('read-tasks'), getTaskById);
router.get('/tasks', authorizePermission('read-tasks'), getAllTasks);
router.post(
  '/tasks',
  validateCreateTask,
  validationHandler,
  authorizePermission('create-tasks'),
  createTask
);
router.put(
  '/tasks/:id',
  validateUpdateTask,
  validationHandler,
  authorizePermission('update-tasks'),
  fullUpdateTask
);
router.patch(
  '/tasks/:id',
  validateUpdateTask,
  validationHandler,
  authorizePermission('update-tasks'),
  partialUpdateTask
);
router.delete('/tasks/:id', authorizePermission('delete-tasks'), deleteTask);

export default router;

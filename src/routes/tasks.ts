import express from 'express';
import {
  createTask,
  deleteTask,
  getAllTasks,
  getTaskById,
  updateTask,
} from '../controllers/taskController';
import {
  validateCreateTask,
  validateUpdateTask,
} from '../middlewares/validators/taskValidator';
import { validationHandler } from '../middlewares/validationHandler';

const router = express.Router();

router.get('/tasks/:id', getTaskById);
router.get('/tasks', getAllTasks);
router.post('/tasks', validateCreateTask, validationHandler, createTask);
router.put('/tasks/:id', validateUpdateTask, validationHandler, updateTask);
router.delete('/tasks/:id', deleteTask);

export default router;

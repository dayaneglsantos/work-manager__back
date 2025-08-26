import express from 'express';
import { validationHandler } from '../middlewares/validationHandler';
import { validateCreateTaskHistory } from '../middlewares/validators/taskHistoryValidator';
import {
  createTaskHistory,
  getAllTaskHistories,
  getTaskHistoryById,
} from '../controllers/taskHistoryController';

const router = express.Router();

router.post(
  '/task_history',
  validateCreateTaskHistory,
  validationHandler,
  createTaskHistory
);
router.get('/task_history/:id', getTaskHistoryById);
router.get('/task_history', getAllTaskHistories);

export default router;

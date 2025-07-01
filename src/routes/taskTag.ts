import express from 'express';
import {
  createTaskTag,
  deleteTaskTag,
  getAllTasksTags,
  getTaskTagById,
} from '../controllers/taskTagController';
import { validationHandler } from '../middlewares/validationHandler';
import { validateTaskTag } from '../middlewares/taskTagValidator';

const router = express.Router();

router.get('/tasks_tags/:id', getTaskTagById);
router.get('/tasks_tags', getAllTasksTags);
router.post('/tasks_tags', validateTaskTag, validationHandler, createTaskTag);
router.delete('/tasks_tags/:id', deleteTaskTag);

export default router;

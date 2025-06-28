import express from 'express';
import {
  createTag,
  getAllTags,
  getTagById,
  updateTag,
  deleteTag,
} from '../controllers/tagController';
import {
  validateCreateTag,
  validateUpdateTag,
} from '../middlewares/tagValidator';
import { validationHandler } from '../middlewares/validationHandler';

const router = express.Router();

router.get('/tags/:id', getTagById);
router.get('/tags', getAllTags);
router.post('/tags', validateCreateTag, validationHandler, createTag);
router.put('/tags/:id', validateUpdateTag, validationHandler, updateTag);
router.delete('/tags/:id', deleteTag);

export default router;

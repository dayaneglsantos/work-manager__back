import express from 'express';
import {
  createComment,
  deleteComment,
  getAllComments,
  getCommentById,
  updateComment,
} from '../controllers/commentController';
import { validationHandler } from '../middlewares/validationHandler';
import {
  validateCreateComment,
  validateUpdateComment,
} from '../middlewares/validators/commentValidator';

const router = express.Router();

router.post(
  '/comments',
  validateCreateComment,
  validationHandler,
  createComment
);
router.get('/comments/:id', getCommentById);
router.get('/comments', getAllComments);
router.put(
  '/comments/:id',
  validateUpdateComment,
  validationHandler,
  updateComment
);
router.delete('/comments/:id', deleteComment);

export default router;

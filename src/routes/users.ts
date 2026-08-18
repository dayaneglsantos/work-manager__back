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
import {
  confirmProfileImageUpload,
  getProfileImageUploadSignature,
  removeProfileImage,
} from '../controllers/profileImageController';
import { authorizeProfileImageUpdate } from '../middlewares/profileImageAuthorization';
import { profileImageSignatureRateLimiter } from '../middlewares/profileImageRateLimiter';
import {
  validateProfileImageTarget,
  validateProfileImageUploadConfirmation,
} from '../middlewares/validators/profileImageValidator';

const router = express.Router();

router.post('/users', validateCreateUser, validationHandler, createUser);
router.get('/users/:id', getUserById);
router.get('/users', validateGetUsers, validationHandler, getAllUsers);
// Endpoint para obter a assinatura de upload de imagem de perfil do usuário
router.post(
  '/users/:id/profile-image/signature',
  validateProfileImageTarget,
  validationHandler,
  profileImageSignatureRateLimiter,
  authorizeProfileImageUpdate,
  getProfileImageUploadSignature
);
// Endpoint para confirmar o upload da imagem de perfil do usuário
router.put(
  '/users/:id/profile-image',
  validateProfileImageTarget,
  validateProfileImageUploadConfirmation,
  validationHandler,
  authorizeProfileImageUpdate,
  confirmProfileImageUpload
);
// Endpoint para remover a imagem de perfil do usuário
router.delete(
  '/users/:id/profile-image',
  validateProfileImageTarget,
  validationHandler,
  authorizeProfileImageUpdate,
  removeProfileImage
);
router.patch(
  '/users/:id',
  validateUpdateUser,
  validationHandler,
  partialUpdateUser
);
router.put('/users/:id', validateUpdateUser, validationHandler, fullUpdateUser);
router.delete('/users/:id', deleteUser);

export default router;

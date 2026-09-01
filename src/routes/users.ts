import express from 'express';
import {
  createUser,
  getUserById,
  getAllUsers,
  partialUpdateUser,
  fullUpdateUser,
  resendPasswordCreationInvitation,
} from '../controllers/userController';
import {
  validateCreateUser,
  validateGetUsers,
  validateUpdateUser,
  validateUserId,
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
import { authorizePermission } from '../middlewares/permissionAuthorization';
import {
  getSelfProfile,
  updateSelfProfile,
} from '../controllers/selfProfileController';
import { validateUpdateSelfProfile } from '../middlewares/validators/selfProfileValidator';

const router = express.Router();

router.get('/users/me', getSelfProfile);
router.patch(
  '/users/me',
  validateUpdateSelfProfile,
  validationHandler,
  updateSelfProfile
);
router.post(
  '/users',
  validateCreateUser,
  validationHandler,
  authorizePermission('create-users'),
  createUser
);
router.get('/users/:id', authorizePermission('read-users'), getUserById);
router.get(
  '/users',
  validateGetUsers,
  validationHandler,
  authorizePermission('read-users'),
  getAllUsers
);
router.post(
  '/users/:id/password-invitation/resend',
  validateUserId,
  validationHandler,
  authorizePermission('update-users'),
  resendPasswordCreationInvitation
);
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
  authorizePermission('update-users'),
  partialUpdateUser
);
router.put(
  '/users/:id',
  validateUpdateUser,
  validationHandler,
  authorizePermission('update-users'),
  fullUpdateUser
);
export default router;

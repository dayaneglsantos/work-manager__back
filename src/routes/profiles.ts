import express from 'express';
import {
  createProfile,
  deleteProfile,
  getAllProfiles,
  getProfileById,
  updateProfile,
} from '../controllers/profileController';
import {
  validateCreateProfile,
  validateUpdateProfile,
} from '../middlewares/validators/profileValidator';
import { validationHandler } from '../middlewares/validationHandler';
import { authorizePermission } from '../middlewares/permissionAuthorization';

const router = express.Router();

router.post(
  '/profiles',
  validateCreateProfile,
  validationHandler,
  authorizePermission('create-profiles'),
  createProfile
);
router.get(
  '/profiles/:id',
  authorizePermission('read-profiles'),
  getProfileById
);
router.get('/profiles', authorizePermission('read-profiles'), getAllProfiles);
router.put(
  '/profiles/:id',
  validateUpdateProfile,
  validationHandler,
  authorizePermission('update-profiles'),
  updateProfile
);
router.delete(
  '/profiles/:id',
  authorizePermission('delete-profiles'),
  deleteProfile
);

export default router;

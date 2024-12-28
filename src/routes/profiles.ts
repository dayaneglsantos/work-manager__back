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
} from '../middlewares/profileValidator';
import { validationHandler } from '../middlewares/validationHandler';

const router = express.Router();

router.post(
  '/profiles',
  validateCreateProfile,
  validationHandler,
  createProfile
);
router.get('/profiles/:id', getProfileById);
router.get('/profiles', getAllProfiles);
router.put(
  '/profiles/:id',
  validateUpdateProfile,
  validationHandler,
  updateProfile
);
router.delete('/profiles/:id', deleteProfile);

export default router;

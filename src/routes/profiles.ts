import express from 'express';
import {
  createProfile,
  deleteProfile,
  getAllProfiles,
  getProfileById,
  updateProfile,
} from '../controllers/profileController';

const router = express.Router();

router.post('/profiles', createProfile);
router.get('/profiles/:id', getProfileById);
router.get('/profiles', getAllProfiles);
router.put('/profiles/:id', updateProfile);
router.delete('/profiles/:id', deleteProfile);

export default router;

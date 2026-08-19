import express from 'express';
import {
  confirmPasswordCreation,
  verifyPasswordCreationCode,
} from '../controllers/passwordCreationController';

const router = express.Router();

router.post('/password-creation/verify', verifyPasswordCreationCode);
router.post('/password-creation/confirm', confirmPasswordCreation);

export default router;

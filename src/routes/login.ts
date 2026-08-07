import express from 'express';
import { login } from '../controllers/authController';
import { validateAuth } from '../middlewares/validators/authValidator';
import { validationHandler } from '../middlewares/validationHandler';

const router = express.Router();

router.post('/login', validateAuth, validationHandler, login);

export default router;

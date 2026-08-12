import express from 'express';
import { login } from '../controllers/authController';
import { validateAuth } from '../middlewares/validators/authValidator';
import { validationHandler } from '../middlewares/validationHandler';
import {
  loginAccountRateLimiter,
  loginIpRateLimiter,
} from '../middlewares/authRateLimiters';

const router = express.Router();

router.post(
  '/login',
  // O IP é verificado primeiro para também contar payloads inválidos.
  loginIpRateLimiter,
  validateAuth,
  validationHandler,
  // Após a validação, o e-mail já está normalizado para ser usado como chave.
  loginAccountRateLimiter,
  login
);

export default router;

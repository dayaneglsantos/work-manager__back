import express from 'express';
import {
  resetPassword,
  confirmPasswordReset,
  verifyPasswordResetCode,
} from '../controllers/resetPasswordController';
import {
  passwordResetAccountRateLimiter,
  passwordResetIpRateLimiter,
} from '../middlewares/authRateLimiters';

const router = express.Router();

router.post(
  '/password-reset/request',
  // Combinamos os dois controles: origem da requisição e e-mail informado.
  passwordResetIpRateLimiter,
  passwordResetAccountRateLimiter,
  resetPassword
); // Gera o código de redefinição de senha e envia para o usuário
router.post('/password-reset/verify', verifyPasswordResetCode); // Verifica o código de redefinição de senha enviado pelo usuário
router.post('/password-reset/confirm', confirmPasswordReset); // Confirma a redefinição de senha e atualiza a senha do usuário

export default router;

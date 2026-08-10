import express from 'express';
import {
  resetPassword,
  confirmPasswordReset,
  verifyPasswordResetCode,
} from '../controllers/resetPasswordController';

const router = express.Router();

router.post('/password-reset/request', resetPassword); // Gera o código de redefinição de senha e envia para o usuário
router.post('/password-reset/verify', verifyPasswordResetCode); // Verifica o código de redefinição de senha enviado pelo usuário
router.post('/password-reset/confirm', confirmPasswordReset); // Confirma a redefinição de senha e atualiza a senha do usuário

export default router;

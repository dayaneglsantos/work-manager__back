import { body } from 'express-validator';

export const validateAuth = [
  body('email')
    .notEmpty()
    .withMessage('E-mail é obrigatório.')
    .bail()
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage('Formato de e-mail inválido.'),
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória.')
    .bail()
    .isLength({ min: 8 })
    .withMessage('A senha deve ter no mínimo oito caracteres.'),
];

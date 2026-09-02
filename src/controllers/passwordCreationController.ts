import { EmploymentStatus, PasswordRequestPurpose } from '@prisma/client';
import { Request, Response } from 'express';
import { env } from '../config/env';
import hashPassword from '../services/hashService';
import {
  generateResetToken,
  hashResetToken,
  verifyResetCode,
} from '../services/passwordResetCryptoService';
import prisma from '../services/prisma';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_PATTERN = /^\d{6}$/;
const TOKEN_PATTERN = /^[a-f0-9]{64}$/;

const INVALID_CODE_RESPONSE = {
  error: 'Código de criação de senha inválido ou expirado.',
};

const INVALID_TOKEN_RESPONSE = {
  error: 'Token de criação de senha inválido ou expirado.',
};

// Verifica o código de criação de senha enviado pelo usuário e retorna um token temporário para a criação da senha
export const verifyPasswordCreationCode = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { email, code } = req.body;

  if (typeof email !== 'string' || !EMAIL_PATTERN.test(email.trim())) {
    return res.status(400).json({ error: 'Informe um e-mail válido.' });
  }

  if (typeof code !== 'string' || !CODE_PATTERN.test(code)) {
    return res.status(400).json(INVALID_CODE_RESPONSE);
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const user = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        password: null,
        employmentStatus: EmploymentStatus.active,
      },
    });

    if (!user) {
      return res.status(400).json(INVALID_CODE_RESPONSE);
    }

    const passwordCreationRequest = await prisma.passwordReset.findFirst({
      where: {
        userId: user.id,
        purpose: PasswordRequestPurpose.passwordCreation,
        verifiedAt: null,
        usedAt: null,
        invalidatedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!passwordCreationRequest) {
      return res.status(400).json(INVALID_CODE_RESPONSE);
    }

    const now = new Date();

    if (passwordCreationRequest.codeExpiresAt <= now) {
      await prisma.passwordReset.updateMany({
        where: {
          id: passwordCreationRequest.id,
          invalidatedAt: null,
        },
        data: { invalidatedAt: now },
      });

      return res.status(400).json(INVALID_CODE_RESPONSE);
    }

    if (passwordCreationRequest.codeAttempts >= 5) {
      return res.status(400).json(INVALID_CODE_RESPONSE);
    }

    const isCodeValid = verifyResetCode(
      code,
      passwordCreationRequest.codeHash,
      env.passwordResetSecret
    );

    if (!isCodeValid) {
      await prisma.passwordReset.updateMany({
        where: {
          id: passwordCreationRequest.id,
          purpose: PasswordRequestPurpose.passwordCreation,
          verifiedAt: null,
          usedAt: null,
          invalidatedAt: null,
          codeExpiresAt: { gt: now },
          codeAttempts: { lt: 5 },
        },
        data: { codeAttempts: { increment: 1 } },
      });

      return res.status(400).json(INVALID_CODE_RESPONSE);
    }

    const passwordToken = generateResetToken();
    const resetTokenHash = hashResetToken(passwordToken);
    const resetTokenExpiresAt = new Date(now.getTime() + 10 * 60 * 1000);

    const verifiedRequest = await prisma.passwordReset.updateMany({
      where: {
        id: passwordCreationRequest.id,
        purpose: PasswordRequestPurpose.passwordCreation,
        verifiedAt: null,
        usedAt: null,
        invalidatedAt: null,
        codeExpiresAt: { gt: now },
        codeAttempts: { lt: 5 },
        user: {
          password: null,
          employmentStatus: EmploymentStatus.active,
        },
      },
      data: {
        verifiedAt: now,
        resetTokenHash,
        resetTokenExpiresAt,
      },
    });

    if (verifiedRequest.count === 0) {
      return res.status(400).json(INVALID_CODE_RESPONSE);
    }

    return res.status(200).json({
      message: 'Código verificado com sucesso.',
      passwordToken,
    });
  } catch (error) {
    console.error('Erro ao verificar o código de criação de senha.', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// Confirma a criação da senha usando o token temporário e a nova senha fornecida pelo usuário
export const confirmPasswordCreation = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { passwordToken, newPassword, confirmPassword } = req.body;

  if (typeof passwordToken !== 'string' || !TOKEN_PATTERN.test(passwordToken)) {
    return res.status(400).json(INVALID_TOKEN_RESPONSE);
  }

  if (typeof newPassword !== 'string' || typeof confirmPassword !== 'string') {
    return res
      .status(400)
      .json({ error: 'Informe a nova senha e a confirmação.' });
  }

  if (newPassword.length < 8) {
    return res
      .status(400)
      .json({ error: 'A senha deve ter no mínimo oito caracteres.' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'As senhas não coincidem.' });
  }

  try {
    const now = new Date();
    const resetTokenHash = hashResetToken(passwordToken);

    const passwordCreationRequest = await prisma.passwordReset.findFirst({
      where: {
        purpose: PasswordRequestPurpose.passwordCreation,
        resetTokenHash,
        resetTokenExpiresAt: { gt: now },
        verifiedAt: { not: null },
        usedAt: null,
        invalidatedAt: null,
        user: {
          password: null,
          employmentStatus: EmploymentStatus.active,
        },
      },
    });

    if (!passwordCreationRequest) {
      return res.status(400).json(INVALID_TOKEN_RESPONSE);
    }

    const hashedPassword = await hashPassword(newPassword);

    const passwordWasCreated = await prisma.$transaction(
      async (transaction) => {
        const consumedToken = await transaction.passwordReset.updateMany({
          where: {
            id: passwordCreationRequest.id,
            purpose: PasswordRequestPurpose.passwordCreation,
            resetTokenHash,
            resetTokenExpiresAt: { gt: new Date() },
            verifiedAt: { not: null },
            usedAt: null,
            invalidatedAt: null,
            user: {
              password: null,
              employmentStatus: EmploymentStatus.active,
            },
          },
          data: { usedAt: new Date() },
        });

        if (consumedToken.count === 0) {
          return false;
        }

        const updatedUser = await transaction.user.updateMany({
          where: {
            id: passwordCreationRequest.userId,
            password: null,
            employmentStatus: EmploymentStatus.active,
          },
          data: { password: hashedPassword },
        });

        if (updatedUser.count === 0) {
          return false;
        }

        await transaction.passwordReset.updateMany({
          where: {
            userId: passwordCreationRequest.userId,
            purpose: PasswordRequestPurpose.passwordCreation,
            id: { not: passwordCreationRequest.id },
            usedAt: null,
            invalidatedAt: null,
          },
          data: { invalidatedAt: new Date() },
        });

        return true;
      }
    );

    if (!passwordWasCreated) {
      return res.status(400).json(INVALID_TOKEN_RESPONSE);
    }

    return res.status(200).json({
      message: 'Senha criada com sucesso. Faça login para acessar sua conta.',
    });
  } catch (error) {
    console.error('Erro ao confirmar a criação de senha.', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

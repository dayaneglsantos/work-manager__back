import { PasswordRequestPurpose } from '@prisma/client';
import { env } from '../config/env';
import { generateResetCode, hashResetCode } from './passwordResetCryptoService';
import prisma from './prisma';
import { sendPasswordCreationEmail } from './sendPasswordCreationEmail';

type InvitationUser = {
  id: number;
  name: string;
  email: string;
};

const PASSWORD_CREATION_CODE_LIFETIME_MS = 48 * 60 * 60 * 1000;

export const sendPasswordCreationInvitation = async (
  user: InvitationUser
): Promise<boolean> => {
  const code = generateResetCode();
  const now = new Date();
  const codeExpiresAt = new Date(
    now.getTime() + PASSWORD_CREATION_CODE_LIFETIME_MS
  );

  // A nova solicitação permanece inválida até o e-mail ser entregue ao SMTP.
  // Assim, um convite anterior continua funcionando se o reenvio falhar.
  const pendingInvitation = await prisma.passwordReset.create({
    data: {
      userId: user.id,
      purpose: PasswordRequestPurpose.passwordCreation,
      codeHash: hashResetCode(code, env.passwordResetSecret),
      codeExpiresAt,
      invalidatedAt: now,
    },
  });

  try {
    const frontendUrl =
      env.nodeEnv === 'production' ? env.frontendProdUrl : env.frontendDevUrl;

    if (!frontendUrl) {
      throw new Error('Frontend URL is not configured');
    }

    const passwordCreationUrl = new URL('/criar-senha', frontendUrl);
    passwordCreationUrl.searchParams.set('email', user.email);

    await sendPasswordCreationEmail({
      email: user.email,
      name: user.name,
      code,
      passwordCreationUrl: passwordCreationUrl.toString(),
    });

    const invitationActivated = await prisma.$transaction(
      async (transaction) => {
        await transaction.passwordReset.updateMany({
          where: {
            userId: user.id,
            purpose: PasswordRequestPurpose.passwordCreation,
            id: { not: pendingInvitation.id },
            usedAt: null,
            invalidatedAt: null,
          },
          data: { invalidatedAt: new Date() },
        });

        return transaction.passwordReset.updateMany({
          where: {
            id: pendingInvitation.id,
            purpose: PasswordRequestPurpose.passwordCreation,
            invalidatedAt: { not: null },
            usedAt: null,
          },
          data: { invalidatedAt: null },
        });
      }
    );

    return invitationActivated.count === 1;
  } catch (error) {
    console.error('Falha ao enviar o convite de criação de senha.', error);
    return false;
  }
};

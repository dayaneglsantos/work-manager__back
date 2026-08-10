import { Request, Response } from 'express';
import { EmploymentStatus } from '@prisma/client';
import bcrypt from 'bcrypt';
import { env } from '../config/env';
import prisma from '../services/prisma';
import hashPassword from '../services/hashService';
import {
  generateResetCode,
  generateResetToken,
  hashResetCode,
  hashResetToken,
  verifyResetCode,
} from '../services/passwordResetCryptoService';
import { sendResetCodeEmail } from '../services/sendResetCodeEmail';

const PASSWORD_RESET_RESPONSE = {
  message:
    'Se o e-mail estiver associado a uma conta ativa, enviaremos um código de recuperação.',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESET_CODE_PATTERN = /^\d{6}$/;
const RESET_TOKEN_PATTERN = /^[a-f0-9]{64}$/;

const INVALID_RESET_CODE_RESPONSE = {
  error: 'Código de recuperação inválido ou expirado.',
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { email } = req.body;

  // Valida o formato básico do e-mail antes de consultar o banco de dados.
  if (typeof email !== 'string' || !EMAIL_PATTERN.test(email.trim())) {
    return res.status(400).json({ error: 'Informe um e-mail válido.' });
  }

  // Normaliza o e-mail para manter o mesmo padrão utilizado na autenticação.
  const normalizedEmail = email.trim().toLowerCase();

  try {
    // Busca somente usuários ativos que podem iniciar a recuperação da senha.
    const existingUser = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        employmentStatus: EmploymentStatus.active,
      },
    });

    // Retorna a mesma mensagem para contas inexistentes ou inativas, evitando a enumeração de usuários.
    if (!existingUser) {
      return res.status(200).json(PASSWORD_RESET_RESPONSE);
    }

    // Gera o código de redefinição e armazena somente o seu hash.
    const code = generateResetCode();
    const hashedCode = hashResetCode(code, env.passwordResetSecret);
    const now = new Date();
    const codeExpiresAt = new Date(now.getTime() + 15 * 60 * 1000);

    // Cria a nova solicitação inicialmente invalidada. Ela só será ativada depois que o envio do e-mail for concluído.
    const pendingPasswordReset = await prisma.passwordReset.create({
      data: {
        userId: existingUser.id,
        codeHash: hashedCode,
        codeExpiresAt,
        invalidatedAt: now,
      },
    });

    try {
      // Envia o código antes de substituir uma recuperação anterior que ainda possa ser utilizada.
      await sendResetCodeEmail(existingUser.email, code);
    } catch (error) {
      // Mantém a nova solicitação invalidada quando o envio falha, sem interromper um fluxo anterior válido.
      console.error('Falha ao enviar o código de recuperação.', error);
      return res.status(200).json(PASSWORD_RESET_RESPONSE);
    }

    await prisma.$transaction(async (transaction) => {
      // Invalida todos os códigos e tokens anteriores que ainda não foram utilizados.
      await transaction.passwordReset.updateMany({
        where: {
          userId: existingUser.id,
          id: { not: pendingPasswordReset.id },
          usedAt: null,
          invalidatedAt: null,
        },
        data: {
          invalidatedAt: new Date(),
        },
      });

      // Ativa somente a nova solicitação depois que o código foi enviado com sucesso.
      await transaction.passwordReset.update({
        where: {
          id: pendingPasswordReset.id,
        },
        data: {
          invalidatedAt: null,
        },
      });
    });

    return res.status(200).json(PASSWORD_RESET_RESPONSE);
  } catch (error) {
    console.error('Erro ao solicitar a recuperação de senha.', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// ########################################################################################################

export const verifyPasswordResetCode = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { email, code } = req.body;

  // Valida o formato básico do e-mail antes de consultar o banco de dados.
  if (typeof email !== 'string' || !EMAIL_PATTERN.test(email.trim())) {
    return res.status(400).json({ error: 'Informe um e-mail válido.' });
  }

  // O código deve conter exatamente seis dígitos, incluindo possíveis zeros à esquerda.
  if (typeof code !== 'string' || !RESET_CODE_PATTERN.test(code)) {
    return res.status(400).json(INVALID_RESET_CODE_RESPONSE);
  }

  // Normaliza o e-mail para manter o mesmo padrão utilizado na autenticação.
  const normalizedEmail = email.trim().toLowerCase();

  try {
    // Busca somente usuários ativos que podem iniciar a recuperação da senha.
    const existingUser = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        employmentStatus: EmploymentStatus.active,
      },
    });

    // Usa a mesma resposta para usuário inexistente, inativo ou sem solicitação válida.
    if (!existingUser) {
      return res.status(400).json(INVALID_RESET_CODE_RESPONSE);
    }

    // Busca a solicitação mais recente que ainda não foi verificada, utilizada ou invalidada.
    const passwordResetRequest = await prisma.passwordReset.findFirst({
      where: {
        userId: existingUser.id,
        verifiedAt: null,
        usedAt: null,
        invalidatedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!passwordResetRequest) {
      return res.status(400).json(INVALID_RESET_CODE_RESPONSE);
    }

    const now = new Date();

    // Invalida explicitamente a solicitação quando o código já expirou.
    if (passwordResetRequest.codeExpiresAt <= now) {
      await prisma.passwordReset.updateMany({
        where: {
          id: passwordResetRequest.id,
          invalidatedAt: null,
        },
        data: {
          invalidatedAt: now,
        },
      });

      return res.status(400).json(INVALID_RESET_CODE_RESPONSE);
    }

    // Bloqueia a validação depois de cinco tentativas incorretas.
    if (passwordResetRequest.codeAttempts >= 5) {
      return res.status(400).json(INVALID_RESET_CODE_RESPONSE);
    }

    // Compara o código com o hash armazenado usando uma comparação segura contra ataques de tempo.
    const isCodeValid = verifyResetCode(
      code,
      passwordResetRequest.codeHash,
      env.passwordResetSecret
    );

    if (!isCodeValid) {
      // Incrementa a tentativa somente se a solicitação ainda puder ser validada.
      await prisma.passwordReset.updateMany({
        where: {
          id: passwordResetRequest.id,
          verifiedAt: null,
          usedAt: null,
          invalidatedAt: null,
          codeExpiresAt: { gt: now },
          codeAttempts: { lt: 5 },
        },
        data: {
          codeAttempts: { increment: 1 },
        },
      });

      return res.status(400).json(INVALID_RESET_CODE_RESPONSE);
    }

    // Gera um token temporário e armazena somente o seu hash por dez minutos.
    const resetToken = generateResetToken();
    const resetTokenHash = hashResetToken(resetToken);
    const resetTokenExpiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutos

    // A atualização condicional garante que o mesmo código não gere dois tokens em requisições simultâneas.
    const updateResult = await prisma.passwordReset.updateMany({
      where: {
        id: passwordResetRequest.id,
        verifiedAt: null,
        usedAt: null,
        invalidatedAt: null,
        codeExpiresAt: { gt: now }, // gt significa "greater than" (maior que), garantindo que o código ainda não tenha expirado
        codeAttempts: { lt: 5 }, // lt significa "less than" (menor que), garantindo que ainda não tenha atingido o limite de tentativas
      },
      data: {
        verifiedAt: now,
        resetTokenHash,
        resetTokenExpiresAt,
      },
    });

    // Se nenhuma linha foi atualizada, outra requisição consumiu ou invalidou o código.
    if (updateResult.count === 0) {
      return res.status(400).json(INVALID_RESET_CODE_RESPONSE);
    }

    // O token puro é entregue apenas nesta resposta e deve permanecer somente em memória no frontend.
    return res.status(200).json({
      message: 'Código de recuperação verificado com sucesso.',
      resetToken,
    });
  } catch (error) {
    console.error('Erro ao verificar o código de recuperação.', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

// ########################################################################################################

export const confirmPasswordReset = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { resetToken, newPassword, confirmPassword } = req.body;

  // Valida o formato do token de 256 bits gerado depois da verificação do código.
  if (typeof resetToken !== 'string' || !RESET_TOKEN_PATTERN.test(resetToken)) {
    return res
      .status(400)
      .json({ error: 'Token de recuperação inválido ou expirado.' });
  }

  // Garante que a nova senha e sua confirmação sejam valores de texto.
  if (typeof newPassword !== 'string' || typeof confirmPassword !== 'string') {
    return res
      .status(400)
      .json({ error: 'Informe a nova senha e a confirmação.' });
  }

  // Mantém o mesmo requisito mínimo de senha utilizado no restante da autenticação.
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
    const resetTokenHash = hashResetToken(resetToken);

    // Busca somente um token verificado, ativo, não utilizado e pertencente a um usuário ativo.
    const passwordResetRequest = await prisma.passwordReset.findFirst({
      where: {
        resetTokenHash,
        resetTokenExpiresAt: { gt: now },
        verifiedAt: { not: null },
        usedAt: null,
        invalidatedAt: null,
        user: {
          employmentStatus: EmploymentStatus.active,
        },
      },
      include: {
        user: true,
      },
    });

    if (!passwordResetRequest) {
      return res
        .status(400)
        .json({ error: 'Token de recuperação inválido ou expirado.' });
    }

    // Impede que a senha atual seja reutilizada como nova senha.
    const isCurrentPassword = await bcrypt.compare(
      newPassword,
      passwordResetRequest.user.password
    );

    if (isCurrentPassword) {
      return res
        .status(400)
        .json({ error: 'A nova senha deve ser diferente da senha atual.' });
    }

    // Gera o hash bcrypt antes de iniciar a transação para reduzir o tempo de bloqueio no banco.
    const hashedPassword = await hashPassword(newPassword);

    const passwordWasUpdated = await prisma.$transaction(
      async (transaction) => {
        // Consome o token somente se ele continuar válido no momento da atualização.
        const consumedToken = await transaction.passwordReset.updateMany({
          where: {
            id: passwordResetRequest.id,
            resetTokenHash,
            resetTokenExpiresAt: { gt: new Date() },
            verifiedAt: { not: null },
            usedAt: null,
            invalidatedAt: null,
            user: {
              employmentStatus: EmploymentStatus.active,
            },
          },
          data: {
            usedAt: new Date(),
          },
        });

        // Outra requisição pode ter utilizado ou invalidado o token enquanto o hash era gerado.
        if (consumedToken.count === 0) {
          return false;
        }

        // Atualiza a senha somente depois de reservar o uso único do token.
        await transaction.user.update({
          where: {
            id: passwordResetRequest.userId,
          },
          data: {
            password: hashedPassword,
          },
        });

        // Invalida todos os demais códigos e tokens de recuperação do usuário.
        await transaction.passwordReset.updateMany({
          where: {
            userId: passwordResetRequest.userId,
            id: { not: passwordResetRequest.id },
            usedAt: null,
            invalidatedAt: null,
          },
          data: {
            invalidatedAt: new Date(),
          },
        });

        return true;
      }
    );

    if (!passwordWasUpdated) {
      return res
        .status(400)
        .json({ error: 'Token de recuperação inválido ou expirado.' });
    }

    // A redefinição não autentica o usuário automaticamente; ele deve realizar um novo login.
    return res.status(200).json({
      message: 'Senha redefinida com sucesso. Faça login com a nova senha.',
    });
  } catch (error) {
    console.error('Erro ao confirmar a redefinição de senha.', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

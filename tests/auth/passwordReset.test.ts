import bcrypt from 'bcrypt';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

// O estado é criado antes dos mocks para registrar destinatários sem SMTP real.
const emailMock = vi.hoisted(() => ({ sent: [] as string[] }));
const RESET_CODE = '482731';
const RESET_TOKEN = 'a'.repeat(64);

vi.mock('../../src/services/sendResetCodeEmail', () => ({
  sendResetCodeEmail: vi.fn(async (email: string) => {
    emailMock.sent.push(email);
  }),
}));

// Código e token determinísticos tornam as requisições previsíveis, mantendo
// as funções reais de hash e verificação criptográfica.
vi.mock(
  '../../src/services/passwordResetCryptoService',
  async (importOriginal) => {
    const original =
      await importOriginal<
        typeof import('../../src/services/passwordResetCryptoService')
      >();

    return {
      ...original,
      generateResetCode: () => RESET_CODE,
      generateResetToken: () => RESET_TOKEN,
    };
  }
);

import { app } from '../../src/app';
import { env } from '../../src/config/env';
import {
  hashResetCode,
  hashResetToken,
} from '../../src/services/passwordResetCryptoService';
import prisma from '../../src/services/prisma';
import {
  clearDatabase,
  createTestUser,
  TEST_EMAIL,
  TEST_PASSWORD,
} from '../helpers/database';

const NEW_PASSWORD = 'new-password-456';

// Cria diretamente os estados de código necessários para cenários de erro,
// sem precisar esperar quinze minutos para testar expiração.
const createCodeRequest = async (
  userId: number,
  options: {
    expiresAt?: Date;
    attempts?: number;
    verifiedAt?: Date | null;
  } = {}
) =>
  prisma.passwordReset.create({
    data: {
      userId,
      codeHash: hashResetCode(RESET_CODE, env.passwordResetSecret),
      codeExpiresAt: options.expiresAt ?? new Date(Date.now() + 15 * 60 * 1000),
      codeAttempts: options.attempts ?? 0,
      verifiedAt: options.verifiedAt,
    },
  });

const createTokenRequest = async (
  userId: number,
  token = RESET_TOKEN,
  options: { expiresAt?: Date; usedAt?: Date | null } = {}
) =>
  prisma.passwordReset.create({
    data: {
      userId,
      codeHash: hashResetCode(RESET_CODE, env.passwordResetSecret),
      codeExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
      verifiedAt: new Date(),
      resetTokenHash: hashResetToken(token),
      resetTokenExpiresAt:
        options.expiresAt ?? new Date(Date.now() + 10 * 60 * 1000),
      usedAt: options.usedAt,
    },
  });

describe('Password reset', () => {
  // Limpa tanto o mock de e-mail quanto o banco antes de cada cenário.
  beforeEach(async () => {
    emailMock.sent.length = 0;
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  it('sends a code only to an active account', async () => {
    // Confirma a persistência da solicitação e a tentativa de envio do e-mail.
    await createTestUser();

    const response = await request(app)
      .post('/password-reset/request')
      .send({ email: TEST_EMAIL });

    expect(response.status).toBe(200);
    expect(emailMock.sent).toEqual([TEST_EMAIL]);
    expect(await prisma.passwordReset.count()).toBe(1);
  });

  it('uses the same generic response for inactive and missing accounts', async () => {
    // Respostas idênticas evitam revelar quais endereços possuem uma conta.
    await createTestUser('inactive');

    const inactive = await request(app)
      .post('/password-reset/request')
      .send({ email: TEST_EMAIL });
    const missing = await request(app)
      .post('/password-reset/request')
      .send({ email: 'missing@work-manager.local' });

    expect(inactive.status).toBe(200);
    expect(missing.status).toBe(200);
    expect(inactive.body).toEqual(missing.body);
    expect(emailMock.sent).toEqual([]);
  });

  it('increments attempts for an incorrect code', async () => {
    // Uma tentativa inválida deve ser persistida para permitir o bloqueio.
    const user = await createTestUser();
    const reset = await createCodeRequest(user.id);

    const response = await request(app)
      .post('/password-reset/verify')
      .send({ email: TEST_EMAIL, code: '111111' });
    const stored = await prisma.passwordReset.findUniqueOrThrow({
      where: { id: reset.id },
    });

    expect(response.status).toBe(400);
    expect(stored.codeAttempts).toBe(1);
  });

  it('rejects and invalidates an expired code', async () => {
    // O registro expirado é recusado e marcado para não voltar a ser usado.
    const user = await createTestUser();
    const reset = await createCodeRequest(user.id, {
      expiresAt: new Date(Date.now() - 1000),
    });

    const response = await request(app)
      .post('/password-reset/verify')
      .send({ email: TEST_EMAIL, code: RESET_CODE });
    const stored = await prisma.passwordReset.findUniqueOrThrow({
      where: { id: reset.id },
    });

    expect(response.status).toBe(400);
    expect(stored.invalidatedAt).not.toBeNull();
  });

  it('rejects a code blocked after five errors', async () => {
    // Mesmo um código correto não pode ser aceito após atingir o limite.
    const user = await createTestUser();
    await createCodeRequest(user.id, { attempts: 5 });

    const response = await request(app)
      .post('/password-reset/verify')
      .send({ email: TEST_EMAIL, code: RESET_CODE });

    expect(response.status).toBe(400);
  });

  it('verifies a valid code once and returns an in-memory token', async () => {
    // A primeira validação gera o token; a segunda tentativa reutiliza o código.
    const user = await createTestUser();
    await createCodeRequest(user.id);

    const valid = await request(app)
      .post('/password-reset/verify')
      .send({ email: TEST_EMAIL, code: RESET_CODE });
    const reused = await request(app)
      .post('/password-reset/verify')
      .send({ email: TEST_EMAIL, code: RESET_CODE });

    expect(valid.status).toBe(200);
    expect(valid.body.resetToken).toBe(RESET_TOKEN);
    expect(reused.status).toBe(400);
  });

  it('rejects invalid and expired reset tokens', async () => {
    // Testa um hash inexistente e outro token cujo prazo já terminou.
    const user = await createTestUser();
    const expiredToken = 'b'.repeat(64);
    await createTokenRequest(user.id, expiredToken, {
      expiresAt: new Date(Date.now() - 1000),
    });

    const invalid = await request(app)
      .post('/password-reset/confirm')
      .send({
        resetToken: 'c'.repeat(64),
        newPassword: NEW_PASSWORD,
        confirmPassword: NEW_PASSWORD,
      });
    const expired = await request(app).post('/password-reset/confirm').send({
      resetToken: expiredToken,
      newPassword: NEW_PASSWORD,
      confirmPassword: NEW_PASSWORD,
    });

    expect(invalid.status).toBe(400);
    expect(expired.status).toBe(400);
  });

  it('rejects short, mismatched and current passwords without consuming the token', async () => {
    // Erros de senha não podem consumir o token, permitindo uma nova correção.
    const user = await createTestUser();
    const reset = await createTokenRequest(user.id);

    const short = await request(app).post('/password-reset/confirm').send({
      resetToken: RESET_TOKEN,
      newPassword: 'short',
      confirmPassword: 'short',
    });
    const mismatched = await request(app).post('/password-reset/confirm').send({
      resetToken: RESET_TOKEN,
      newPassword: NEW_PASSWORD,
      confirmPassword: 'other-password',
    });
    const current = await request(app).post('/password-reset/confirm').send({
      resetToken: RESET_TOKEN,
      newPassword: TEST_PASSWORD,
      confirmPassword: TEST_PASSWORD,
    });
    const stored = await prisma.passwordReset.findUniqueOrThrow({
      where: { id: reset.id },
    });

    expect(short.status).toBe(400);
    expect(mismatched.status).toBe(400);
    expect(current.status).toBe(400);
    expect(stored.usedAt).toBeNull();
  });

  it('resets the password, consumes the token and invalidates other artifacts', async () => {
    // Valida a transação completa e garante o uso único do token.
    const user = await createTestUser();
    const mainReset = await createTokenRequest(user.id);
    const otherReset = await createCodeRequest(user.id);

    const response = await request(app).post('/password-reset/confirm').send({
      resetToken: RESET_TOKEN,
      newPassword: NEW_PASSWORD,
      confirmPassword: NEW_PASSWORD,
    });
    const mainStored = await prisma.passwordReset.findUniqueOrThrow({
      where: { id: mainReset.id },
    });
    const otherStored = await prisma.passwordReset.findUniqueOrThrow({
      where: { id: otherReset.id },
    });
    const updatedUser = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    });

    expect(response.status).toBe(200);
    expect(mainStored.usedAt).not.toBeNull();
    expect(otherStored.invalidatedAt).not.toBeNull();
    expect(await bcrypt.compare(NEW_PASSWORD, updatedUser.password)).toBe(true);

    const reused = await request(app).post('/password-reset/confirm').send({
      resetToken: RESET_TOKEN,
      newPassword: 'third-password',
      confirmPassword: 'third-password',
    });
    expect(reused.status).toBe(400);
  });
});

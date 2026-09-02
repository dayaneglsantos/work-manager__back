import bcrypt from 'bcrypt';
import { PasswordRequestPurpose } from '@prisma/client';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

const CREATION_CODE = '482731';
const PASSWORD_TOKEN = 'd'.repeat(64);
const NEW_PASSWORD = 'first-password-456';

vi.mock(
  '../../src/services/passwordResetCryptoService',
  async (importOriginal) => {
    const original =
      await importOriginal<
        typeof import('../../src/services/passwordResetCryptoService')
      >();

    return {
      ...original,
      generateResetToken: () => PASSWORD_TOKEN,
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
import { clearDatabase, createTestUser, TEST_EMAIL } from '../helpers/database';

const createPendingUser = async (status: 'active' | 'inactive' = 'active') => {
  const user = await createTestUser(status);
  return prisma.user.update({
    where: { id: user.id },
    data: { password: null },
  });
};

const createCodeRequest = (
  userId: number,
  purpose: PasswordRequestPurpose = PasswordRequestPurpose.passwordCreation
) =>
  prisma.passwordReset.create({
    data: {
      userId,
      purpose,
      codeHash: hashResetCode(CREATION_CODE, env.passwordResetSecret),
      codeExpiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    },
  });

const createTokenRequest = (userId: number) =>
  prisma.passwordReset.create({
    data: {
      userId,
      purpose: 'passwordCreation',
      codeHash: hashResetCode(CREATION_CODE, env.passwordResetSecret),
      codeExpiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      verifiedAt: new Date(),
      resetTokenHash: hashResetToken(PASSWORD_TOKEN),
      resetTokenExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

describe('Password creation', () => {
  beforeEach(clearDatabase);

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  it('verifies a valid creation code and returns a short-lived token', async () => {
    const user = await createPendingUser();
    await createCodeRequest(user.id);

    const response = await request(app)
      .post('/password-creation/verify')
      .send({ email: TEST_EMAIL, code: CREATION_CODE });

    expect(response.status).toBe(200);
    expect(response.body.passwordToken).toBe(PASSWORD_TOKEN);
  });

  it('increments attempts for an invalid creation code', async () => {
    const user = await createPendingUser();
    const invitation = await createCodeRequest(user.id);

    const response = await request(app)
      .post('/password-creation/verify')
      .send({ email: TEST_EMAIL, code: '111111' });
    const stored = await prisma.passwordReset.findUniqueOrThrow({
      where: { id: invitation.id },
    });

    expect(response.status).toBe(400);
    expect(stored.codeAttempts).toBe(1);
  });

  it('does not accept a password-reset code as a password-creation code', async () => {
    const user = await createPendingUser();
    await createCodeRequest(user.id, PasswordRequestPurpose.passwordReset);

    const response = await request(app)
      .post('/password-creation/verify')
      .send({ email: TEST_EMAIL, code: CREATION_CODE });

    expect(response.status).toBe(400);
  });

  it('creates the first password and consumes the token', async () => {
    const user = await createPendingUser();
    const invitation = await createTokenRequest(user.id);

    const response = await request(app)
      .post('/password-creation/confirm')
      .send({
        passwordToken: PASSWORD_TOKEN,
        newPassword: NEW_PASSWORD,
        confirmPassword: NEW_PASSWORD,
      });
    const updatedUser = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    });
    const stored = await prisma.passwordReset.findUniqueOrThrow({
      where: { id: invitation.id },
    });

    expect(response.status).toBe(200);
    expect(updatedUser.password).not.toBeNull();
    expect(await bcrypt.compare(NEW_PASSWORD, updatedUser.password!)).toBe(
      true
    );
    expect(stored.usedAt).not.toBeNull();
  });

  it('rejects a creation token after the account becomes inactive', async () => {
    const user = await createPendingUser('inactive');
    await createTokenRequest(user.id);

    const response = await request(app)
      .post('/password-creation/confirm')
      .send({
        passwordToken: PASSWORD_TOKEN,
        newPassword: NEW_PASSWORD,
        confirmPassword: NEW_PASSWORD,
      });

    expect(response.status).toBe(400);
  });

  it('rejects a creation token after the account already has a password', async () => {
    const user = await createPendingUser();
    await createTokenRequest(user.id);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: await bcrypt.hash('already-created', 4) },
    });

    const response = await request(app)
      .post('/password-creation/confirm')
      .send({
        passwordToken: PASSWORD_TOKEN,
        newPassword: NEW_PASSWORD,
        confirmPassword: NEW_PASSWORD,
      });

    expect(response.status).toBe(400);
  });
});

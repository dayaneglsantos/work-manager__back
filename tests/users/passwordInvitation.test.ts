import cookieParser from 'cookie-parser';
import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

const emailMock = vi.hoisted(() => ({
  sentTo: [] as string[],
  shouldFail: false,
}));

vi.mock('../../src/services/sendPasswordCreationEmail', () => ({
  sendPasswordCreationEmail: vi.fn(async ({ email }: { email: string }) => {
    emailMock.sentTo.push(email);
    if (emailMock.shouldFail) {
      throw new Error('SMTP unavailable');
    }
  }),
}));

import { env } from '../../src/config/env';
import { authenticateToken } from '../../src/middlewares/authMiddleware';
import userRoutes from '../../src/routes/users';
import prisma from '../../src/services/prisma';
import { clearDatabase } from '../helpers/database';

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(authenticateToken);
app.use(userRoutes);

const createUserWithProfile = async (
  profileName: string,
  email: string,
  cpf: string,
  password: string | null
) => {
  const profile = await prisma.profile.create({
    data: { name: profileName },
  });

  return prisma.user.create({
    data: {
      name: `${profileName} User`,
      email,
      cpf,
      password,
      admissionDate: new Date('2026-01-01'),
      currentPosition: 'Tester',
      currentSalary: 1,
      profileId: profile.id,
    },
  });
};

const authCookieFor = (userId: number): string =>
  `token=${jwt.sign({ userId }, env.jwtSecret, { expiresIn: '1h' })}`;

describe('Password invitation resend', () => {
  beforeEach(async () => {
    emailMock.sentTo.length = 0;
    emailMock.shouldFail = false;
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  it('allows an Admin to resend an invitation and invalidates the previous one', async () => {
    const admin = await createUserWithProfile(
      'Admin',
      'admin@work-manager.local',
      '10000000019',
      'admin-password-hash'
    );
    const target = await createUserWithProfile(
      'Funcionario',
      'pending@work-manager.local',
      '10000000108',
      null
    );
    const previousInvitation = await prisma.passwordReset.create({
      data: {
        userId: target.id,
        purpose: 'passwordCreation',
        codeHash: 'previous-code-hash',
        codeExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const response = await request(app)
      .post(`/users/${target.id}/password-invitation/resend`)
      .set('Cookie', authCookieFor(admin.id));
    const usersResponse = await request(app)
      .get('/users')
      .set('Cookie', authCookieFor(admin.id));
    const invitations = await prisma.passwordReset.findMany({
      where: { userId: target.id },
      orderBy: { createdAt: 'asc' },
    });

    expect(response.status).toBe(200);
    expect(emailMock.sentTo).toEqual([target.email]);
    expect(
      usersResponse.body.data.find(({ id }: { id: number }) => id === target.id)
    ).toMatchObject({ hasPassword: false });
    expect(
      usersResponse.body.data.find(({ id }: { id: number }) => id === target.id)
    ).not.toHaveProperty('password');
    expect(invitations).toHaveLength(2);
    expect(
      invitations.find(({ id }) => id === previousInvitation.id)?.invalidatedAt
    ).not.toBeNull();
    expect(invitations.at(-1)?.invalidatedAt).toBeNull();
  });

  it('forbids a non-Admin from resending an invitation', async () => {
    const requester = await createUserWithProfile(
      'Gerente',
      'manager@work-manager.local',
      '10000000280',
      'manager-password-hash'
    );
    const target = await createUserWithProfile(
      'Funcionario',
      'pending@work-manager.local',
      '10000000361',
      null
    );

    const response = await request(app)
      .post(`/users/${target.id}/password-invitation/resend`)
      .set('Cookie', authCookieFor(requester.id));

    expect(response.status).toBe(403);
    expect(emailMock.sentTo).toEqual([]);
  });

  it('rejects a resend after the user has created a password', async () => {
    const admin = await createUserWithProfile(
      'Admin',
      'admin@work-manager.local',
      '10000000442',
      'admin-password-hash'
    );
    const target = await createUserWithProfile(
      'Funcionario',
      'active@work-manager.local',
      '10000000523',
      'created-password-hash'
    );

    const response = await request(app)
      .post(`/users/${target.id}/password-invitation/resend`)
      .set('Cookie', authCookieFor(admin.id));

    expect(response.status).toBe(409);
    expect(emailMock.sentTo).toEqual([]);
    expect(await prisma.passwordReset.count()).toBe(0);
  });

  it('keeps the previous invitation active when the new email fails', async () => {
    emailMock.shouldFail = true;
    const admin = await createUserWithProfile(
      'Admin',
      'admin@work-manager.local',
      '10000000604',
      'admin-password-hash'
    );
    const target = await createUserWithProfile(
      'Funcionario',
      'pending@work-manager.local',
      '10000000795',
      null
    );
    const previousInvitation = await prisma.passwordReset.create({
      data: {
        userId: target.id,
        purpose: 'passwordCreation',
        codeHash: 'previous-code-hash',
        codeExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const response = await request(app)
      .post(`/users/${target.id}/password-invitation/resend`)
      .set('Cookie', authCookieFor(admin.id));
    const previousStored = await prisma.passwordReset.findUniqueOrThrow({
      where: { id: previousInvitation.id },
    });
    const invitations = await prisma.passwordReset.findMany({
      where: { userId: target.id },
    });

    expect(response.status).toBe(502);
    expect(previousStored.invalidatedAt).toBeNull();
    expect(invitations).toHaveLength(2);
    expect(
      invitations.filter(({ invalidatedAt }) => invalidatedAt)
    ).toHaveLength(1);
  });
});

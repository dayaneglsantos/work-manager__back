import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

const emailMock = vi.hoisted(() => ({
  inputs: [] as Array<{
    email: string;
    name: string;
    code: string;
    passwordCreationUrl: string;
  }>,
  shouldFail: false,
}));

vi.mock('../../src/services/sendPasswordCreationEmail', () => ({
  sendPasswordCreationEmail: vi.fn(
    async (input: (typeof emailMock.inputs)[number]) => {
      emailMock.inputs.push(input);
      if (emailMock.shouldFail) {
        throw new Error('SMTP unavailable');
      }
    }
  ),
}));

vi.mock(
  '../../src/services/passwordResetCryptoService',
  async (importOriginal) => {
    const original =
      await importOriginal<
        typeof import('../../src/services/passwordResetCryptoService')
      >();

    return {
      ...original,
      generateResetCode: () => '482731',
    };
  }
);

import { app } from '../../src/app';
import prisma from '../../src/services/prisma';
import { clearDatabase } from '../helpers/database';

const createProfile = () =>
  prisma.profile.create({ data: { name: `Profile ${Date.now()}` } });

const buildPayload = (profileId: number) => ({
  name: 'New User',
  email: 'new-user@work-manager.local',
  cpf: '11144477735',
  phoneNumber: '11999999999',
  profileId,
  supervisorId: null,
  departmentId: null,
  currentSalary: 1000,
  admissionDate: '2026-09-01',
  currentPosition: 'Developer',
  employmentStatus: 'active',
  statusReason: null,
});

describe('User creation invitation', () => {
  beforeEach(async () => {
    emailMock.inputs.length = 0;
    emailMock.shouldFail = false;
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  it('creates a user without a password and activates a 48-hour invitation after sending the email', async () => {
    const profile = await createProfile();
    const startedAt = Date.now();

    const response = await request(app)
      .post('/users')
      .send(buildPayload(profile.id));

    const user = await prisma.user.findUniqueOrThrow({
      where: { email: 'new-user@work-manager.local' },
    });
    const invitation = await prisma.passwordReset.findFirstOrThrow({
      where: { userId: user.id },
    });

    expect(response.status).toBe(201);
    expect(response.body).not.toHaveProperty('password');
    expect(response.body.invitationSent).toBe(true);
    expect(user.password).toBeNull();
    expect(invitation.purpose).toBe('passwordCreation');
    expect(invitation.invalidatedAt).toBeNull();
    expect(invitation.codeExpiresAt.getTime()).toBeGreaterThanOrEqual(
      startedAt + 48 * 60 * 60 * 1000
    );
    expect(emailMock.inputs).toEqual([
      {
        email: user.email,
        name: user.name,
        code: '482731',
        passwordCreationUrl:
          'http://localhost:2400/criar-senha?email=new-user%40work-manager.local',
      },
    ]);
  });

  it('keeps the user and the invitation invalid when sending the email fails', async () => {
    emailMock.shouldFail = true;
    const profile = await createProfile();

    const response = await request(app)
      .post('/users')
      .send(buildPayload(profile.id));

    const user = await prisma.user.findUniqueOrThrow({
      where: { email: 'new-user@work-manager.local' },
    });
    const invitation = await prisma.passwordReset.findFirstOrThrow({
      where: { userId: user.id },
    });

    expect(response.status).toBe(201);
    expect(response.body.invitationSent).toBe(false);
    expect(user.password).toBeNull();
    expect(invitation.invalidatedAt).not.toBeNull();
  });
});

import jwt from 'jsonwebtoken';
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
import { env } from '../../src/config/env';
import prisma from '../../src/services/prisma';
import { clearDatabase } from '../helpers/database';

const createProfile = () =>
  prisma.profile.create({ data: { name: `Profile ${Date.now()}` } });

const createAdmin = async () => {
  const profile = await prisma.profile.create({ data: { name: 'Admin' } });

  return prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@work-manager.local',
      cpf: '10000000019',
      password: 'admin-password-hash',
      admissionDate: new Date('2026-01-01'),
      currentPosition: 'Administrator',
      currentSalary: 1,
      profileId: profile.id,
    },
  });
};

const authCookieFor = (userId: number): string =>
  `token=${jwt.sign({ userId }, env.jwtSecret, { expiresIn: '1h' })}`;

const buildPayload = (profileId: number) => ({
  name: 'New User',
  email: 'new-user@work-manager.local',
  cpf: '11144477735',
  phoneNumber: '11999999999',
  profileId,
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
    const admin = await createAdmin();
    const profile = await createProfile();
    const startedAt = Date.now();

    const response = await request(app)
      .post('/users')
      .set('Cookie', authCookieFor(admin.id))
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
    const admin = await createAdmin();
    const profile = await createProfile();

    const response = await request(app)
      .post('/users')
      .set('Cookie', authCookieFor(admin.id))
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

  it('normalizes a masked phone number and zip code before persisting them', async () => {
    const admin = await createAdmin();
    const profile = await createProfile();

    const response = await request(app)
      .post('/users')
      .set('Cookie', authCookieFor(admin.id))
      .send({
        ...buildPayload(profile.id),
        phoneNumber: '(11) 99999-9999',
        address: {
          zipCode: '12345-678',
          state: 'SP',
          city: 'São Paulo',
          street: 'Rua Teste',
          number: 10,
          complement: null,
        },
      });

    expect(response.status).toBe(201);

    const user = await prisma.user.findUniqueOrThrow({
      where: { email: 'new-user@work-manager.local' },
      include: { address: true },
    });

    expect(user.phoneNumber).toBe('11999999999');
    expect(user.address?.zipCode).toBe('12345678');
  });

  it('rejects a phone number with more than 11 digits', async () => {
    const admin = await createAdmin();
    const profile = await createProfile();

    const response = await request(app)
      .post('/users')
      .set('Cookie', authCookieFor(admin.id))
      .send({
        ...buildPayload(profile.id),
        phoneNumber: '119999999999',
      });

    expect(response.status).toBe(400);
    expect(
      await prisma.user.findUnique({
        where: { email: 'new-user@work-manager.local' },
      })
    ).toBeNull();
  });

  it('rejects an address with an invalid zip code', async () => {
    const admin = await createAdmin();
    const profile = await createProfile();

    const response = await request(app)
      .post('/users')
      .set('Cookie', authCookieFor(admin.id))
      .send({
        ...buildPayload(profile.id),
        address: {
          zipCode: '1234-567',
          state: 'SP',
          city: 'São Paulo',
          street: 'Rua Teste',
          number: 10,
          complement: null,
        },
      });

    expect(response.status).toBe(400);
    expect(
      await prisma.user.findUnique({
        where: { email: 'new-user@work-manager.local' },
      })
    ).toBeNull();
  });
});

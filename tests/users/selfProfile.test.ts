import bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';
import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { env } from '../../src/config/env';
import { authenticateToken } from '../../src/middlewares/authMiddleware';
import userRoutes from '../../src/routes/users';
import prisma from '../../src/services/prisma';
import {
  clearDatabase,
  createTestUser,
  TEST_PASSWORD,
} from '../helpers/database';

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(authenticateToken);
app.use(userRoutes);

const authCookieFor = (userId: number): string =>
  `token=${jwt.sign({ userId }, env.jwtSecret, { expiresIn: '1h' })}`;

describe('Self profile', () => {
  beforeEach(clearDatabase);

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  it('returns only the authenticated user personal profile', async () => {
    const user = await createTestUser();

    const response = await request(app)
      .get('/users/me')
      .set('Cookie', authCookieFor(user.id));

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      profileImage: user.profileImage,
      address: null,
    });
    expect(response.body).not.toHaveProperty('password');
    expect(response.body).not.toHaveProperty('currentSalary');
    expect(response.body).not.toHaveProperty('profileId');
  });

  it('updates allowed personal data and normalizes phone and zip code', async () => {
    const user = await createTestUser();

    const response = await request(app)
      .patch('/users/me')
      .set('Cookie', authCookieFor(user.id))
      .send({
        name: 'Updated Name',
        phoneNumber: '(61) 99999-9999',
        address: {
          zipCode: '70000-000',
          state: 'DF',
          city: 'Brasília',
          street: 'Rua Teste',
          number: 10,
          complement: null,
        },
      });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: user.id,
      name: 'Updated Name',
      email: user.email,
      phoneNumber: '61999999999',
      address: {
        zipCode: '70000000',
        state: 'DF',
        city: 'Brasília',
        street: 'Rua Teste',
        number: 10,
        complement: null,
      },
    });
  });

  it('removes an address idempotently', async () => {
    const user = await createTestUser();
    await prisma.address.create({
      data: {
        userId: user.id,
        zipCode: '70000000',
        state: 'DF',
        city: 'Brasília',
        street: 'Rua Teste',
        number: 10,
      },
    });

    const firstResponse = await request(app)
      .patch('/users/me')
      .set('Cookie', authCookieFor(user.id))
      .send({ address: null });
    const secondResponse = await request(app)
      .patch('/users/me')
      .set('Cookie', authCookieFor(user.id))
      .send({ address: null });

    expect(firstResponse.status).toBe(200);
    expect(firstResponse.body.address).toBeNull();
    expect(secondResponse.status).toBe(200);
    expect(secondResponse.body.address).toBeNull();
  });

  it.each(['email', 'profileId', 'currentSalary', 'employmentStatus'])(
    'rejects the protected field %s',
    async (field) => {
      const user = await createTestUser();

      const response = await request(app)
        .patch('/users/me')
        .set('Cookie', authCookieFor(user.id))
        .send({ [field]: 'unauthorized-value' });

      expect(response.status).toBe(400);
    }
  );

  it('changes the password after confirming the current password', async () => {
    const user = await createTestUser();
    const passwordReset = await prisma.passwordReset.create({
      data: {
        userId: user.id,
        purpose: 'passwordReset',
        codeHash: 'active-code',
        codeExpiresAt: new Date(Date.now() + 60_000),
      },
    });

    const response = await request(app)
      .patch('/users/me')
      .set('Cookie', authCookieFor(user.id))
      .send({
        currentPassword: TEST_PASSWORD,
        newPassword: 'new-password-456',
        confirmPassword: 'new-password-456',
      });

    expect(response.status).toBe(200);

    const storedUser = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    });
    expect(await bcrypt.compare('new-password-456', storedUser.password!)).toBe(
      true
    );

    const invalidatedReset = await prisma.passwordReset.findUniqueOrThrow({
      where: { id: passwordReset.id },
    });
    expect(invalidatedReset.invalidatedAt).not.toBeNull();
  });

  it('rejects an incorrect current password without changing it', async () => {
    const user = await createTestUser();

    const response = await request(app)
      .patch('/users/me')
      .set('Cookie', authCookieFor(user.id))
      .send({
        currentPassword: 'incorrect-password',
        newPassword: 'new-password-456',
        confirmPassword: 'new-password-456',
      });

    expect(response.status).toBe(400);

    const storedUser = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    });
    expect(await bcrypt.compare(TEST_PASSWORD, storedUser.password!)).toBe(
      true
    );
  });
});

import cookieParser from 'cookie-parser';
import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { env } from '../../src/config/env';
import { authenticateToken } from '../../src/middlewares/authMiddleware';
import userRoutes from '../../src/routes/users';
import prisma from '../../src/services/prisma';
import { clearDatabase, createTestUser } from '../helpers/database';

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(authenticateToken);
app.use(userRoutes);

const authCookieFor = (userId: number): string =>
  `token=${jwt.sign({ userId }, env.jwtSecret, { expiresIn: '1h' })}`;

describe('Generic user update', () => {
  beforeEach(clearDatabase);

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  it.each(['patch', 'put'] as const)(
    'rejects password changes through %s /users/:id',
    async (method) => {
      const user = await createTestUser();
      const originalPassword = user.password;

      const response = await request(app)
        [method](`/users/${user.id}`)
        .set('Cookie', authCookieFor(user.id))
        .send({ password: 'plain-text-password' });

      expect(response.status).toBe(400);
      expect(response.body.errors).toContainEqual({
        error_message:
          'Password cannot be changed through the generic user update endpoint',
      });

      const storedUser = await prisma.user.findUniqueOrThrow({
        where: { id: user.id },
      });
      expect(storedUser.password).toBe(originalPassword);
    }
  );

  it('does not expose physical user deletion', async () => {
    const user = await createTestUser();

    const response = await request(app)
      .delete(`/users/${user.id}`)
      .set('Cookie', authCookieFor(user.id));

    expect(response.status).toBe(404);
    expect(
      await prisma.user.findUnique({ where: { id: user.id } })
    ).not.toBeNull();
  });
});

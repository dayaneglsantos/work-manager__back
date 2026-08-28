import jwt from 'jsonwebtoken';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { app } from '../../src/app';
import { env } from '../../src/config/env';
import { resetAuthRateLimiters } from '../../src/middlewares/authRateLimiters';
import prisma from '../../src/services/prisma';
import {
  clearDatabase,
  createTestUser,
  TEST_EMAIL,
  TEST_PASSWORD,
} from '../helpers/database';

describe('Authentication', () => {
  // Isola os cenários e encerra a conexão do Prisma ao final do arquivo.
  beforeEach(async () => {
    await resetAuthRateLimiters();
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  it('logs in with valid credentials and returns a secure cookie', async () => {
    // Exercita a rota completa: validação, autenticação, resposta e cookie.
    await createTestUser();

    const response = await request(app)
      .post('/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      name: 'Authentication Test User',
      permissions: [],
    });
    expect(response.headers['set-cookie'][0]).toMatch(/HttpOnly/);
    expect(response.headers['set-cookie'][0]).toMatch(/SameSite=Strict/);
    expect(response.headers['set-cookie'][0]).toMatch(/Path=\//);
  });

  it('normalizes the email before authentication', async () => {
    // Espaços e letras maiúsculas devem chegar normalizados ao serviço.
    await createTestUser();

    const response = await request(app)
      .post('/login')
      .send({
        email: `  ${TEST_EMAIL.toUpperCase()}  `,
        password: TEST_PASSWORD,
      });

    expect(response.status).toBe(200);
  });

  it('rejects invalid credentials and malformed payloads', async () => {
    // Separa falha de autenticação (401) de payload inválido (400).
    await createTestUser();

    const invalidCredentials = await request(app)
      .post('/login')
      .send({ email: TEST_EMAIL, password: 'wrong-password' });
    const invalidPayload = await request(app)
      .post('/login')
      .send({ email: 'invalid', password: 'short' });

    expect(invalidCredentials.status).toBe(401);
    expect(invalidPayload.status).toBe(400);
    expect(invalidPayload.body.errors).toBeInstanceOf(Array);
  });

  it('rejects an account that has not created its first password', async () => {
    const user = await createTestUser();
    await prisma.user.update({
      where: { id: user.id },
      data: { password: null },
    });

    const response = await request(app)
      .post('/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(response.status).toBe(401);
  });

  it.each(['inactive', 'terminated', 'resigned'] as const)(
    'blocks users with %s employment status',
    async (status) => {
      await createTestUser(status);

      const response = await request(app)
        .post('/login')
        .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

      expect(response.status).toBe(401);
    }
  );

  it('applies custom permissions over profile permissions', async () => {
    // O perfil permite a leitura, mas a exceção individual deve prevalecer.
    const user = await createTestUser();
    const action = await prisma.permissionAction.create({
      data: { name: 'read' },
    });
    const type = await prisma.permissionType.create({
      data: { name: 'users' },
    });
    const permission = await prisma.permission.create({
      data: {
        name: 'read-users',
        actionId: action.id,
        typeId: type.id,
      },
    });
    await prisma.profilePermission.create({
      data: {
        profileId: user.profileId,
        permissionId: permission.id,
        hasPermission: true,
      },
    });
    await prisma.customPermission.create({
      data: {
        userId: user.id,
        permissionId: permission.id,
        hasPermission: false,
      },
    });

    const response = await request(app)
      .post('/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(response.status).toBe(200);
    expect(response.body.permissions).toContainEqual({
      name: 'read-users',
      hasPermission: false,
    });
  });

  it('rejects missing, invalid, expired and revoked JWTs', async () => {
    // Reúne os quatro estados públicos que devem resultar em sessão inválida.
    const user = await createTestUser();
    const expiredToken = jwt.sign({ userId: user.id }, env.jwtSecret, {
      expiresIn: -1,
    });
    const validToken = jwt.sign({ userId: user.id }, env.jwtSecret, {
      expiresIn: '1h',
    });

    expect((await request(app).get('/users')).status).toBe(401);

    const invalid = await request(app)
      .get('/users')
      .set('Cookie', 'token=invalid');
    expect(invalid.status).toBe(401);
    expect(invalid.headers['set-cookie'][0]).toMatch(/^token=;/);

    expect(
      (await request(app).get('/users').set('Cookie', `token=${expiredToken}`))
        .status
    ).toBe(401);

    await prisma.user.update({
      where: { id: user.id },
      data: { employmentStatus: 'inactive' },
    });
    const revoked = await request(app)
      .get('/users')
      .set('Cookie', `token=${validToken}`);
    expect(revoked.status).toBe(401);
    expect(revoked.body.code).toBe('USER_ACCESS_REVOKED');
  });

  it('allows repeated logout requests', async () => {
    // Logout é idempotente: repetir a operação continua sendo seguro.
    const first = await request(app).post('/logout');
    const second = await request(app).post('/logout');

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
  });
});

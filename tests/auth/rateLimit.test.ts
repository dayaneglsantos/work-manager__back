import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { app } from '../../src/app';
import { resetAuthRateLimiters } from '../../src/middlewares/authRateLimiters';
import { clearDatabase, createTestUser, TEST_EMAIL } from '../helpers/database';

describe('Authentication rate limiting', () => {
  // Os stores ficam em memória; zerá-los impede que um teste contamine o outro.
  beforeEach(async () => {
    await resetAuthRateLimiters();
    await clearDatabase();
  });

  it('limits failed login attempts by account', async () => {
    // A sexta falha para o mesmo e-mail deve ser bloqueada.
    await createTestUser();

    for (let attempt = 1; attempt <= 5; attempt += 1) {
      const response = await request(app)
        .post('/login')
        .send({ email: TEST_EMAIL, password: 'wrong-password' });
      expect(response.status).toBe(401);
    }

    const blocked = await request(app)
      .post('/login')
      .send({ email: TEST_EMAIL, password: 'wrong-password' });

    expect(blocked.status).toBe(429);
  });

  it('limits login attempts by IP across different accounts', async () => {
    // E-mails diferentes isolam a regra global por origem da requisição.
    for (let attempt = 1; attempt <= 10; attempt += 1) {
      const response = await request(app)
        .post('/login')
        .send({
          email: `missing-${attempt}@work-manager.local`,
          password: 'wrong-password',
        });
      expect(response.status).toBe(401);
    }

    const blocked = await request(app).post('/login').send({
      email: 'another-missing@work-manager.local',
      password: 'wrong-password',
    });

    expect(blocked.status).toBe(429);
  });

  it('keeps a generic response after the recovery account limit', async () => {
    // A quarta solicitação é bloqueada sem revelar isso pela resposta pública.
    await createTestUser('inactive');

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const response = await request(app)
        .post('/password-reset/request')
        .send({ email: TEST_EMAIL });
      expect(response.status).toBe(200);
    }

    const blocked = await request(app)
      .post('/password-reset/request')
      .send({ email: TEST_EMAIL });

    expect(blocked.status).toBe(200);
    expect(blocked.body.message).toBe(
      'Se o e-mail estiver cadastrado, você receberá um código.'
    );
  });

  it('limits recovery requests by IP across different accounts', async () => {
    // A 11ª solicitação completa o limite por IP, independentemente do e-mail.
    for (let attempt = 1; attempt <= 10; attempt += 1) {
      const response = await request(app)
        .post('/password-reset/request')
        .send({ email: `missing-${attempt}@work-manager.local` });
      expect(response.status).toBe(200);
    }

    const blocked = await request(app)
      .post('/password-reset/request')
      .send({ email: 'another-missing@work-manager.local' });

    expect(blocked.status).toBe(200);
    expect(blocked.headers.ratelimit).toContain('r=0');
  });
});

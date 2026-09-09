import { EmploymentStatus } from '@prisma/client';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { app } from '../../src/app';
import { env } from '../../src/config/env';
import prisma from '../../src/services/prisma';
import { clearDatabase, createTestUser } from '../helpers/database';

let cookie: string;
let profileId: number;

const createOption = (
  name: string,
  index: number,
  employmentStatus: EmploymentStatus = EmploymentStatus.active
) =>
  prisma.user.create({
    data: {
      name,
      email: `option-${index}@work-manager.local`,
      cpf: String(50000000000 + index),
      admissionDate: new Date('2024-01-01'),
      currentPosition: 'Tester',
      currentSalary: 1,
      profileId,
      employmentStatus,
      profileImage: index === 1 ? 'https://example.com/avatar.jpg' : null,
    },
  });

describe('User options', () => {
  beforeEach(async () => {
    await clearDatabase();
    const actor = await createTestUser();
    profileId = actor.profileId;
    cookie = `token=${jwt.sign({ userId: actor.id }, env.jwtSecret, {
      expiresIn: '1h',
    })}`;
  });

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  it('returns a minimal, ordered and paginated active-user list without read-users permission', async () => {
    await createOption('Ana Beatriz', 1);
    await createOption('Ana Alice', 2);
    await createOption('Ana Carolina', 3);
    await createOption('Ana Inativa', 4, EmploymentStatus.inactive);

    const first = await request(app)
      .get('/users/options?search=Ana&page=1&pageSize=1')
      .set('Cookie', cookie);
    const second = await request(app)
      .get('/users/options?search=Ana&page=2&pageSize=1')
      .set('Cookie', cookie);

    expect(first.status).toBe(200);
    expect(first.body.data).toEqual([
      {
        id: expect.any(Number),
        name: 'Ana Alice',
        profileImage: null,
        employmentStatus: 'active',
      },
    ]);
    expect(first.body.meta).toEqual({
      page: 1,
      pageSize: 1,
      totalCount: 3,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: false,
    });
    expect(second.body.data[0].name).toBe('Ana Beatriz');
    expect(second.body.meta.hasPreviousPage).toBe(true);
    expect(Object.keys(first.body.data[0]).sort()).toEqual(
      ['employmentStatus', 'id', 'name', 'profileImage'].sort()
    );
  });

  it('accepts an explicit status and default pagination', async () => {
    await createOption('Ana Inativa', 1, EmploymentStatus.inactive);

    const response = await request(app)
      .get('/users/options?search=Ana&employmentStatus=inactive')
      .set('Cookie', cookie);

    expect(response.status).toBe(200);
    expect(response.body.data[0]).toMatchObject({
      name: 'Ana Inativa',
      employmentStatus: 'inactive',
    });
    expect(response.body.meta).toMatchObject({ page: 1, pageSize: 20 });
  });

  it.each([
    '/users/options?search=An',
    '/users/options?search=Ana&page=0',
    '/users/options?search=Ana&pageSize=51',
    '/users/options?search=Ana&employmentStatus=unknown',
  ])('rejects invalid query parameters: %s', async (path) => {
    const response = await request(app).get(path).set('Cookie', cookie);
    expect(response.status).toBe(400);
  });

  it('requires an authenticated session', async () => {
    const response = await request(app).get('/users/options?search=Ana');
    expect(response.status).toBe(401);
  });
});

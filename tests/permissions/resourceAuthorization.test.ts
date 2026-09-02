import jwt from 'jsonwebtoken';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { app } from '../../src/app';
import { env } from '../../src/config/env';
import prisma from '../../src/services/prisma';
import { clearDatabase, createTestUser } from '../helpers/database';

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

interface AuthorizationCase {
  method: HttpMethod;
  path: string;
  permission: string;
  body?: Record<string, unknown>;
}

const cases: AuthorizationCase[] = [
  {
    method: 'post',
    path: '/users',
    permission: 'create-users',
    body: {
      name: 'New User',
      email: 'new-user@work-manager.local',
      cpf: '52998224725',
      phoneNumber: '11999999999',
      profileId: 1,
      currentSalary: 1000,
      admissionDate: '2024-01-01',
      currentPosition: 'Tester',
    },
  },
  { method: 'get', path: '/users/1', permission: 'read-users' },
  { method: 'get', path: '/users', permission: 'read-users' },
  {
    method: 'patch',
    path: '/users/1',
    permission: 'update-users',
    body: { name: 'Updated' },
  },
  {
    method: 'put',
    path: '/users/1',
    permission: 'update-users',
    body: { name: 'Updated' },
  },
  { method: 'get', path: '/addresses/1', permission: 'read-users' },
  { method: 'get', path: '/addresses', permission: 'read-users' },
  {
    method: 'post',
    path: '/profiles',
    permission: 'create-profiles',
    body: { name: 'Profile' },
  },
  { method: 'get', path: '/profiles/1', permission: 'read-profiles' },
  { method: 'get', path: '/profiles', permission: 'read-profiles' },
  {
    method: 'put',
    path: '/profiles/1',
    permission: 'update-profiles',
    body: { name: 'Profile' },
  },
  { method: 'delete', path: '/profiles/1', permission: 'delete-profiles' },
  {
    method: 'post',
    path: '/departments',
    permission: 'create-departments',
    body: { name: 'Department', managerId: 1 },
  },
  { method: 'get', path: '/departments/1', permission: 'read-departments' },
  { method: 'get', path: '/departments', permission: 'read-departments' },
  {
    method: 'patch',
    path: '/departments/1',
    permission: 'update-departments',
    body: { name: 'Department' },
  },
  {
    method: 'put',
    path: '/departments/1',
    permission: 'update-departments',
    body: { name: 'Department' },
  },
  {
    method: 'delete',
    path: '/departments/1',
    permission: 'delete-departments',
  },
  {
    method: 'post',
    path: '/tasks',
    permission: 'create-tasks',
    body: { title: 'Task' },
  },
  { method: 'get', path: '/tasks/1', permission: 'read-tasks' },
  { method: 'get', path: '/tasks', permission: 'read-tasks' },
  {
    method: 'patch',
    path: '/tasks/1',
    permission: 'update-tasks',
    body: { title: 'Task' },
  },
  {
    method: 'put',
    path: '/tasks/1',
    permission: 'update-tasks',
    body: { title: 'Task' },
  },
  { method: 'delete', path: '/tasks/1', permission: 'delete-tasks' },
];

const authCookieFor = (userId: number): string =>
  `token=${jwt.sign({ userId }, env.jwtSecret, { expiresIn: '1h' })}`;

describe('Resource authorization', () => {
  beforeEach(clearDatabase);

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  it.each(cases)(
    'requires $permission for $method $path',
    async ({ method, path, permission, body }) => {
      const user = await createTestUser();
      const call = request(app)
        [method](path)
        .set('Cookie', authCookieFor(user.id));
      const response = body ? await call.send(body) : await call;

      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({
        code: 'PERMISSION_DENIED',
        permission,
      });
    }
  );
});

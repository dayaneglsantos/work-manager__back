import { EmploymentStatus } from '@prisma/client';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { app } from '../../src/app';
import { env } from '../../src/config/env';
import prisma from '../../src/services/prisma';
import {
  clearDatabase,
  createTestUser,
  grantProfilePermissions,
} from '../helpers/database';

let cookie: string;
let actor: Awaited<ReturnType<typeof createTestUser>>;
let sequence = 0;
const member = async (
  status: EmploymentStatus = 'active',
  departmentId?: number
) => {
  sequence += 1;
  return prisma.user.create({
    data: {
      name: 'Department member',
      email: 'department-' + sequence + '@work-manager.local',
      cpf: String(30000000000 + sequence),
      admissionDate: new Date('2024-01-01'),
      currentPosition: 'Tester',
      currentSalary: 1,
      profileId: actor.profileId,
      employmentStatus: status,
      departmentId,
    },
  });
};
const department = (name = 'Operações') =>
  prisma.department.create({ data: { name, managerId: actor.id } });

describe('Department management', () => {
  beforeEach(async () => {
    await clearDatabase();
    actor = await createTestUser();
    await grantProfilePermissions(actor.profileId, [
      'read-departments',
      'create-departments',
      'update-departments',
      'delete-departments',
      'update-users',
    ]);
    cookie =
      'token=' +
      jwt.sign({ userId: actor.id }, env.jwtSecret, { expiresIn: '1h' });
  });
  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  it('creates a normalized department with a required active manager', async () => {
    const response = await request(app)
      .post('/departments')
      .set('Cookie', cookie)
      .send({ name: '  Operações  ', managerId: actor.id });
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      name: 'Operações',
      managerId: actor.id,
    });
    const missing = await request(app)
      .post('/departments')
      .set('Cookie', cookie)
      .send({ name: 'Other' });
    expect(missing.status).toBe(400);
  });

  it.each(['inactive', 'terminated', 'resigned'] as const)(
    'rejects new assignments to a %s manager',
    async (status) => {
      const target = await member(status);
      const existing = await department();
      const created = await request(app)
        .post('/departments')
        .set('Cookie', cookie)
        .send({ name: 'New', managerId: target.id });
      const updated = await request(app)
        .patch('/departments/' + existing.id)
        .set('Cookie', cookie)
        .send({ managerId: target.id });
      expect(created.status).toBe(400);
      expect(updated.status).toBe(400);
      expect(
        (
          await prisma.department.findUniqueOrThrow({
            where: { id: existing.id },
          })
        ).managerId
      ).toBe(actor.id);
    }
  );

  it.each(['inactive', 'terminated', 'resigned'] as const)(
    'preserves the manager after status becomes %s and allows renaming',
    async (status) => {
      const target = await member();
      const first = await prisma.department.create({
        data: { name: 'First', managerId: target.id },
      });
      const second = await prisma.department.create({
        data: { name: 'Second', managerId: target.id },
      });
      const change = await request(app)
        .patch('/users/' + target.id)
        .set('Cookie', cookie)
        .send({ employmentStatus: status, statusReason: 'Status changed' });
      expect(change.status).toBe(200);
      for (const current of [first, second]) {
        const renamed = await request(app)
          .patch('/departments/' + current.id)
          .set('Cookie', cookie)
          .send({
            name: current.name + ' renamed',
            ...(current.id === first.id && { managerId: target.id }),
          });
        expect(renamed.status).toBe(200);
        expect(renamed.body.managerId).toBe(target.id);
      }
      const result = await request(app)
        .get('/departments/' + first.id)
        .set('Cookie', cookie);
      expect(result.body.manager).toEqual({
        id: target.id,
        name: target.name,
        employmentStatus: status,
        profileImage: null,
      });
    }
  );

  it('changes only the manager when other departments exist', async () => {
    const existing = await department();
    await department('Other');
    const target = await member();
    const response = await request(app)
      .patch('/departments/' + existing.id)
      .set('Cookie', cookie)
      .send({ managerId: target.id });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      name: existing.name,
      managerId: target.id,
    });
  });

  it('returns conflicts for duplicate names and accepts the unchanged name', async () => {
    const existing = await department();
    const other = await department('Other');
    const duplicate = await request(app)
      .post('/departments')
      .set('Cookie', cookie)
      .send({ name: '  Operações  ', managerId: actor.id });
    const renamed = await request(app)
      .patch('/departments/' + other.id)
      .set('Cookie', cookie)
      .send({ name: 'Operações' });
    const same = await request(app)
      .patch('/departments/' + existing.id)
      .set('Cookie', cookie)
      .send({ name: ' Operações ' });
    expect(duplicate.status).toBe(409);
    expect(renamed.status).toBe(409);
    expect(same.status).toBe(200);
  });

  it('lists all member statuses, zero counts and only public manager fields', async () => {
    const existing = await department();
    const empty = await department('Empty');
    for (const status of [
      'active',
      'inactive',
      'terminated',
      'resigned',
    ] as const)
      await member(status, existing.id);
    const response = await request(app)
      .get('/departments')
      .set('Cookie', cookie);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: existing.id, _count: { users: 4 } }),
        expect.objectContaining({ id: empty.id, _count: { users: 0 } }),
      ])
    );
    expect(response.body[0].manager).toEqual({
      id: actor.id,
      name: actor.name,
      employmentStatus: 'active',
      profileImage: actor.profileImage,
    });
    const detail = await request(app)
      .get('/departments/' + existing.id)
      .set('Cookie', cookie);
    expect(detail.body._count.users).toBe(4);
  });

  it.each(['active', 'inactive', 'terminated', 'resigned'] as const)(
    'deletes the department and preserves its %s members without a department',
    async (status) => {
      const existing = await department();
      const user = await member(status, existing.id);
      const anotherUser = await member(status, existing.id);
      const otherDepartment = await department('Other');
      const unaffectedUser = await member(status, otherDepartment.id);
      const response = await request(app)
        .delete('/departments/' + existing.id)
        .set('Cookie', cookie);
      expect(response.status).toBe(204);
      expect(response.text).toBe('');
      expect(
        (await prisma.user.findUniqueOrThrow({ where: { id: user.id } }))
          .departmentId
      ).toBeNull();
      expect(
        await prisma.user.findUniqueOrThrow({ where: { id: anotherUser.id } })
      ).toMatchObject({ departmentId: null, employmentStatus: status });
      expect(
        await prisma.user.findUniqueOrThrow({ where: { id: user.id } })
      ).toMatchObject({
        name: user.name,
        email: user.email,
        profileId: user.profileId,
        employmentStatus: status,
      });
      expect(
        await prisma.user.findUniqueOrThrow({
          where: { id: unaffectedUser.id },
        })
      ).toMatchObject({ departmentId: otherDepartment.id });
      expect(
        await prisma.department.findUnique({ where: { id: existing.id } })
      ).toBeNull();
    }
  );

  it('deletes an empty department without deleting its manager', async () => {
    const existing = await department();
    const response = await request(app)
      .delete('/departments/' + existing.id)
      .set('Cookie', cookie);
    expect(response.status).toBe(204);
    expect(response.text).toBe('');
    expect(
      await prisma.user.findUnique({ where: { id: actor.id } })
    ).not.toBeNull();
  });

  it('returns 404 for a missing department', async () => {
    for (const method of ['get', 'patch', 'delete'] as const) {
      const call = request(app)
        [method]('/departments/2147483647')
        .set('Cookie', cookie);
      const response =
        method === 'patch' ? await call.send({ name: 'Missing' }) : await call;
      expect(response.status).toBe(404);
    }
  });

  it.each(['12abc', '0', '-1', '1.5', '2147483648'])(
    'rejects invalid route id %s on every item route',
    async (id) => {
      for (const method of ['get', 'patch', 'delete'] as const) {
        const call = request(app)
          [method]('/departments/' + id)
          .set('Cookie', cookie);
        const response =
          method === 'patch' ? await call.send({ name: 'Valid' }) : await call;
        expect(response.status).toBe(400);
      }
    }
  );

  it.each([
    {},
    { name: '   ' },
    { name: 'x'.repeat(192) },
    { name: null },
    { name: 123 },
    { managerId: null },
    { managerId: -1 },
    { managerId: 1.5 },
    { managerId: '1' },
    { name: 'Changed', users: { deleteMany: {} } },
    { id: 55 },
  ])('rejects invalid patch payload %j without changes', async (payload) => {
    const existing = await department();
    const response = await request(app)
      .patch('/departments/' + existing.id)
      .set('Cookie', cookie)
      .send(payload);
    expect(response.status).toBe(400);
    expect(
      await prisma.department.findUnique({ where: { id: existing.id } })
    ).toMatchObject({
      name: existing.name,
      managerId: actor.id,
    });
  });

  it('rejects missing managers and unknown create fields', async () => {
    const existing = await department();
    for (const method of ['post', 'patch'] as const) {
      const response = await request(app)
        [method]('/departments' + (method === 'patch' ? '/' + existing.id : ''))
        .set('Cookie', cookie)
        .send({ name: 'New', managerId: 2147483647 });
      expect(response.status).toBe(400);
    }
    expect(
      (
        await request(app)
          .post('/departments')
          .set('Cookie', cookie)
          .send({ name: 'New', managerId: actor.id, id: 55 })
      ).status
    ).toBe(400);
  });

  it('requires authentication and leaves PUT unavailable', async () => {
    expect((await request(app).get('/departments')).status).toBe(401);
    const existing = await department();
    expect(
      (
        await request(app)
          .put('/departments/' + existing.id)
          .set('Cookie', cookie)
          .send({ name: 'Changed' })
      ).status
    ).toBe(404);
  });
});


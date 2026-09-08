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

const profilePermissions = [
  'create-profiles',
  'read-profiles',
  'update-profiles',
  'delete-profiles',
];

const createProfileManager = async () => {
  const user = await createTestUser();
  await grantProfilePermissions(user.profileId, profilePermissions);

  return {
    user,
    cookie: `token=${jwt.sign({ userId: user.id }, env.jwtSecret, {
      expiresIn: '1h',
    })}`,
  };
};

describe('Profile management', () => {
  beforeEach(clearDatabase);

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  it('creates a normalized profile with denied permissions by default', async () => {
    const { cookie } = await createProfileManager();

    const response = await request(app)
      .post('/profiles')
      .set('Cookie', cookie)
      .send({ name: '  Operações  ' });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      name: 'Operações',
      fullAccess: false,
    });

    const assignments = await prisma.profilePermission.findMany({
      where: { profileId: response.body.id },
    });

    expect(assignments).toHaveLength(profilePermissions.length);
    expect(assignments.every(({ hasPermission }) => !hasPermission)).toBe(true);
  });

  it('rejects invalid and duplicated profile names', async () => {
    const { cookie } = await createProfileManager();
    await prisma.profile.create({ data: { name: 'Financeiro' } });

    const emptyName = await request(app)
      .post('/profiles')
      .set('Cookie', cookie)
      .send({ name: '   ' });
    const nonStringName = await request(app)
      .post('/profiles')
      .set('Cookie', cookie)
      .send({ name: 123 });
    const duplicatedName = await request(app)
      .post('/profiles')
      .set('Cookie', cookie)
      .send({ name: 'Financeiro' });

    expect(emptyName.status).toBe(400);
    expect(nonStringName.status).toBe(400);
    expect(duplicatedName.status).toBe(409);
  });

  it('lists profiles ordered by name', async () => {
    const { cookie } = await createProfileManager();
    await prisma.profile.createMany({
      data: [{ name: 'Zeladoria' }, { name: 'Atendimento' }],
    });

    const response = await request(app).get('/profiles').set('Cookie', cookie);

    expect(response.status).toBe(200);
    expect(response.body.map(({ name }: { name: string }) => name)).toEqual(
      expect.arrayContaining(['Atendimento', 'Zeladoria'])
    );

    const names = response.body.map(({ name }: { name: string }) => name);
    expect(names).toEqual(
      [...names].sort((first, second) => first.localeCompare(second))
    );
  });

  it('counts users in every employment status, including the system owner in Admin', async () => {
    const { user, cookie } = await createProfileManager();
    const emptyProfile = await prisma.profile.create({
      data: { name: 'Sem usuários' },
    });
    const admin = await prisma.profile.create({
      data: { name: 'Admin', fullAccess: true },
    });
    const statuses = ['active', 'inactive', 'terminated', 'resigned'] as const;

    for (const [index, employmentStatus] of statuses.entries()) {
      await prisma.user.create({
        data: {
          name: `Colaborador ${employmentStatus}`,
          email: `profile-count-${index}@work-manager.local`,
          cpf: `2000000000${index}`,
          admissionDate: new Date('2024-01-01'),
          employmentStatus,
          currentPosition: 'Tester',
          currentSalary: 1,
          profileId: user.profileId,
        },
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { profileId: admin.id },
    });
    await prisma.systemOwner.create({ data: { id: 1, userId: user.id } });

    const response = await request(app).get('/profiles').set('Cookie', cookie);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: user.profileId, userCount: 4 }),
        expect.objectContaining({
          id: admin.id,
          fullAccess: true,
          userCount: 1,
        }),
        expect.objectContaining({ id: emptyProfile.id, userCount: 0 }),
      ])
    );
  });

  it('updates a regular profile and returns the updated resource', async () => {
    const { cookie } = await createProfileManager();
    const profile = await prisma.profile.create({ data: { name: 'Antigo' } });

    const response = await request(app)
      .put(`/profiles/${profile.id}`)
      .set('Cookie', cookie)
      .send({ name: '  Novo nome  ' });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: profile.id,
      name: 'Novo nome',
      fullAccess: false,
    });
  });

  it('rejects a duplicated name when updating a profile', async () => {
    const { cookie } = await createProfileManager();
    await prisma.profile.create({ data: { name: 'Existente' } });
    const profile = await prisma.profile.create({ data: { name: 'Editável' } });

    const response = await request(app)
      .put(`/profiles/${profile.id}`)
      .set('Cookie', cookie)
      .send({ name: 'Existente' });

    expect(response.status).toBe(409);
    expect(
      await prisma.profile.findUnique({ where: { id: profile.id } })
    ).toMatchObject({
      name: 'Editável',
    });
  });

  it('protects full-access profiles from updates and deletion', async () => {
    const { cookie } = await createProfileManager();
    const profile = await prisma.profile.create({
      data: { name: 'Administrador', fullAccess: true },
    });

    const updateResponse = await request(app)
      .put(`/profiles/${profile.id}`)
      .set('Cookie', cookie)
      .send({ name: 'Outro nome' });
    const deleteResponse = await request(app)
      .delete(`/profiles/${profile.id}`)
      .set('Cookie', cookie);

    expect(updateResponse.status).toBe(409);
    expect(deleteResponse.status).toBe(409);
  });

  it('rejects deleting a profile assigned to users', async () => {
    const { user, cookie } = await createProfileManager();

    const response = await request(app)
      .delete(`/profiles/${user.profileId}`)
      .set('Cookie', cookie);

    expect(response.status).toBe(409);
    expect(
      await prisma.profile.findUnique({ where: { id: user.profileId } })
    ).not.toBeNull();
  });

  it('deletes an unused profile and its permission assignments', async () => {
    const { cookie } = await createProfileManager();
    const createResponse = await request(app)
      .post('/profiles')
      .set('Cookie', cookie)
      .send({ name: 'Temporário' });
    const profileId = createResponse.body.id as number;

    const response = await request(app)
      .delete(`/profiles/${profileId}`)
      .set('Cookie', cookie);

    expect(response.status).toBe(204);
    expect(
      await prisma.profile.findUnique({ where: { id: profileId } })
    ).toBeNull();
    expect(await prisma.profilePermission.count({ where: { profileId } })).toBe(
      0
    );
  });
});

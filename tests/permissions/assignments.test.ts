import jwt from 'jsonwebtoken';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { app } from '../../src/app';
import { env } from '../../src/config/env';
import prisma from '../../src/services/prisma';
import { clearDatabase, createTestUser } from '../helpers/database';

const createPermission = async () => {
  const action = await prisma.permissionAction.upsert({
    where: { name: 'read' },
    update: {},
    create: { name: 'read' },
  });
  const type = await prisma.permissionType.create({
    data: { name: 'tasks' },
  });

  return prisma.permission.create({
    data: {
      name: 'read-tasks',
      actionId: action.id,
      typeId: type.id,
    },
  });
};

const grantPermissionManagement = async (profileId: number) => {
  const type = await prisma.permissionType.create({
    data: { name: 'permissions' },
  });
  const actions = await Promise.all(
    ['read', 'update'].map((name) =>
      prisma.permissionAction.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );

  for (const action of actions) {
    const permission = await prisma.permission.create({
      data: {
        name: `${action.name}-permissions`,
        actionId: action.id,
        typeId: type.id,
      },
    });
    await prisma.profilePermission.create({
      data: {
        profileId,
        permissionId: permission.id,
        hasPermission: true,
      },
    });
  }
};

const authenticatedRequest = (userId: number) => {
  const token = jwt.sign({ userId }, env.jwtSecret, { expiresIn: '1h' });

  return `token=${token}`;
};

describe('Permission assignment checklists', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  it('returns and updates the permission checklist of a profile', async () => {
    const user = await createTestUser();
    await grantPermissionManagement(user.profileId);
    const permission = await createPermission();
    const cookie = authenticatedRequest(user.id);

    const updateResponse = await request(app)
      .put(`/profiles/${user.profileId}/permissions`)
      .set('Cookie', cookie)
      .send({
        permissions: [{ permissionId: permission.id, hasPermission: true }],
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.permissions).toContainEqual({
      permissionId: permission.id,
      name: 'read-tasks',
      type: 'tasks',
      action: 'read',
      hasPermission: true,
    });
  });

  it('applies and removes a custom user permission', async () => {
    const user = await createTestUser();
    await grantPermissionManagement(user.profileId);
    const permission = await createPermission();
    const cookie = authenticatedRequest(user.id);

    await prisma.profilePermission.create({
      data: {
        profileId: user.profileId,
        permissionId: permission.id,
        hasPermission: true,
      },
    });

    const customResponse = await request(app)
      .put(`/users/${user.id}/permissions`)
      .set('Cookie', cookie)
      .send({
        permissions: [{ permissionId: permission.id, customValue: false }],
      });

    expect(customResponse.status).toBe(200);
    expect(customResponse.body.permissions).toContainEqual({
      permissionId: permission.id,
      name: 'read-tasks',
      type: 'tasks',
      action: 'read',
      profileValue: true,
      customValue: false,
      effectiveValue: false,
    });

    const inheritedResponse = await request(app)
      .put(`/users/${user.id}/permissions`)
      .set('Cookie', cookie)
      .send({
        permissions: [{ permissionId: permission.id, customValue: null }],
      });

    expect(inheritedResponse.status).toBe(200);
    expect(inheritedResponse.body.permissions).toContainEqual({
      permissionId: permission.id,
      name: 'read-tasks',
      type: 'tasks',
      action: 'read',
      profileValue: true,
      customValue: null,
      effectiveValue: true,
    });
  });

  it('rejects duplicated and unknown permission IDs', async () => {
    const user = await createTestUser();
    await grantPermissionManagement(user.profileId);
    const permission = await createPermission();
    const cookie = authenticatedRequest(user.id);

    const duplicated = await request(app)
      .put(`/profiles/${user.profileId}/permissions`)
      .set('Cookie', cookie)
      .send({
        permissions: [
          { permissionId: permission.id, hasPermission: true },
          { permissionId: permission.id, hasPermission: false },
        ],
      });
    const unknown = await request(app)
      .put(`/profiles/${user.profileId}/permissions`)
      .set('Cookie', cookie)
      .send({
        permissions: [{ permissionId: 999999, hasPermission: true }],
      });

    expect(duplicated.status).toBe(400);
    expect(unknown.status).toBe(400);
  });

  it('denies permission management without the required permission', async () => {
    const user = await createTestUser();
    const cookie = authenticatedRequest(user.id);

    const response = await request(app)
      .get(`/profiles/${user.profileId}/permissions`)
      .set('Cookie', cookie);

    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({
      code: 'PERMISSION_DENIED',
      permission: 'read-permissions',
    });
  });
});

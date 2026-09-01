import cookieParser from 'cookie-parser';
import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/services/cloudinaryService', () => ({
  buildProfileImageUrl: vi.fn(
    () => 'https://res.cloudinary.com/test/image/upload/v1/profile-id.webp'
  ),
  createProfileImageUploadSignature: vi.fn(() => ({
    apiKey: 'public-test-key',
    cloudName: 'test-cloud',
    signature: 'signed-upload-value',
    timestamp: 1_787_000_000,
    uploadPreset: 'work_manager_profile_images_dev',
  })),
  deleteProfileImage: vi.fn(),
  verifyProfileImageUploadResponse: vi.fn(() => true),
}));

import { env } from '../../src/config/env';
import { authenticateToken } from '../../src/middlewares/authMiddleware';
import userRoutes from '../../src/routes/users';
import {
  buildProfileImageUrl,
  createProfileImageUploadSignature,
  deleteProfileImage,
  verifyProfileImageUploadResponse,
} from '../../src/services/cloudinaryService';
import prisma from '../../src/services/prisma';
import { clearDatabase, grantProfilePermissions } from '../helpers/database';

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(authenticateToken);
app.use(userRoutes);

const createUserWithProfile = async (
  profileName: string,
  email: string,
  cpf: string
) => {
  const profile = await prisma.profile.create({
    data: { name: profileName },
  });

  return prisma.user.create({
    data: {
      name: `${profileName} User`,
      email,
      cpf,
      password: 'test-password-hash',
      admissionDate: new Date('2024-01-01'),
      currentPosition: 'Tester',
      currentSalary: 1,
      profileId: profile.id,
    },
  });
};

const authCookieFor = (userId: number): string =>
  `token=${jwt.sign({ userId }, env.jwtSecret, { expiresIn: '1h' })}`;

describe('Profile image upload signature', () => {
  beforeEach(async () => {
    await clearDatabase();
    vi.clearAllMocks();
    vi.mocked(buildProfileImageUrl).mockReturnValue(
      'https://res.cloudinary.com/test/image/upload/v1/profile-id.webp'
    );
    vi.mocked(deleteProfileImage).mockResolvedValue(undefined);
    vi.mocked(verifyProfileImageUploadResponse).mockReturnValue(true);
  });

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  it('allows a user to request a signature for their own image', async () => {
    const user = await createUserWithProfile(
      'Funcionario',
      'self@work-manager.local',
      '10000000019'
    );

    const response = await request(app)
      .post(`/users/${user.id}/profile-image/signature`)
      .set('Cookie', authCookieFor(user.id));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      apiKey: 'public-test-key',
      cloudName: 'test-cloud',
      signature: 'signed-upload-value',
      timestamp: 1_787_000_000,
      uploadPreset: 'work_manager_profile_images_dev',
    });
  });

  it('allows an Admin to request a signature for another user', async () => {
    const admin = await createUserWithProfile(
      'Admin',
      'admin@work-manager.local',
      '10000000108'
    );
    await grantProfilePermissions(admin.profileId, ['update-users']);
    const target = await createUserWithProfile(
      'Funcionario',
      'target@work-manager.local',
      '10000000280'
    );

    const response = await request(app)
      .post(`/users/${target.id}/profile-image/signature`)
      .set('Cookie', authCookieFor(admin.id));

    expect(response.status).toBe(200);
  });

  it('forbids a non-Admin from requesting a signature for another user', async () => {
    const requester = await createUserWithProfile(
      'Funcionario',
      'requester@work-manager.local',
      '10000000361'
    );
    const target = await createUserWithProfile(
      'Gerente',
      'other@work-manager.local',
      '10000000442'
    );

    const response = await request(app)
      .post(`/users/${target.id}/profile-image/signature`)
      .set('Cookie', authCookieFor(requester.id));

    expect(response.status).toBe(403);
    expect(createProfileImageUploadSignature).not.toHaveBeenCalled();
  });

  it('returns 404 when an Admin targets a nonexistent user', async () => {
    const admin = await createUserWithProfile(
      'Admin',
      'admin@work-manager.local',
      '10000000523'
    );
    await grantProfilePermissions(admin.profileId, ['update-users']);

    const response = await request(app)
      .post('/users/999999/profile-image/signature')
      .set('Cookie', authCookieFor(admin.id));

    expect(response.status).toBe(404);
    expect(createProfileImageUploadSignature).not.toHaveBeenCalled();
  });

  it('rejects an invalid target user ID', async () => {
    const user = await createUserWithProfile(
      'Funcionario',
      'invalid-id@work-manager.local',
      '10000000604'
    );

    const response = await request(app)
      .post('/users/not-a-number/profile-image/signature')
      .set('Cookie', authCookieFor(user.id));

    expect(response.status).toBe(400);
    expect(createProfileImageUploadSignature).not.toHaveBeenCalled();
  });

  it('confirms a valid upload and replaces the stored profile image', async () => {
    const user = await createUserWithProfile(
      'Funcionario',
      'confirmation@work-manager.local',
      '10000000795'
    );
    await prisma.user.update({
      where: { id: user.id },
      data: {
        profileImage: 'https://res.cloudinary.com/test/old.webp',
        profileImagePublicId: 'old-profile-id',
      },
    });

    const response = await request(app)
      .put(`/users/${user.id}/profile-image`)
      .set('Cookie', authCookieFor(user.id))
      .send({
        bytes: 450_000,
        format: 'webp',
        publicId: 'profile-id',
        resourceType: 'image',
        signature: 'a'.repeat(40),
        version: 1,
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: user.id,
      profileImage:
        'https://res.cloudinary.com/test/image/upload/v1/profile-id.webp',
    });
    expect(deleteProfileImage).toHaveBeenCalledWith('old-profile-id');

    const updatedUser = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    });
    expect(updatedUser.profileImagePublicId).toBe('profile-id');
  });

  it('rejects a response with an invalid Cloudinary signature', async () => {
    const user = await createUserWithProfile(
      'Funcionario',
      'invalid-signature@work-manager.local',
      '10000000957'
    );
    vi.mocked(verifyProfileImageUploadResponse).mockReturnValue(false);

    const response = await request(app)
      .put(`/users/${user.id}/profile-image`)
      .set('Cookie', authCookieFor(user.id))
      .send({
        bytes: 450_000,
        format: 'webp',
        publicId: 'profile-id',
        resourceType: 'image',
        signature: 'a'.repeat(40),
        version: 1,
      });

    expect(response.status).toBe(400);
    expect(buildProfileImageUrl).not.toHaveBeenCalled();
  });

  it('rejects an image larger than 5 MB before confirmation', async () => {
    const user = await createUserWithProfile(
      'Funcionario',
      'oversized@work-manager.local',
      '10000001090'
    );

    const response = await request(app)
      .put(`/users/${user.id}/profile-image`)
      .set('Cookie', authCookieFor(user.id))
      .send({
        bytes: 5_000_001,
        format: 'webp',
        publicId: 'profile-id',
        resourceType: 'image',
        signature: 'a'.repeat(40),
        version: 1,
      });

    expect(response.status).toBe(400);
    expect(verifyProfileImageUploadResponse).not.toHaveBeenCalled();
  });

  it('deletes a managed profile image and clears its database references', async () => {
    const user = await createUserWithProfile(
      'Funcionario',
      'delete-managed@work-manager.local',
      '10000001170'
    );
    await prisma.user.update({
      where: { id: user.id },
      data: {
        profileImage: 'https://res.cloudinary.com/test/profile.webp',
        profileImagePublicId: 'managed-profile-id',
      },
    });

    const response = await request(app)
      .delete(`/users/${user.id}/profile-image`)
      .set('Cookie', authCookieFor(user.id));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: user.id, profileImage: null });
    expect(deleteProfileImage).toHaveBeenCalledWith('managed-profile-id');

    const updatedUser = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    });
    expect(updatedUser.profileImage).toBeNull();
    expect(updatedUser.profileImagePublicId).toBeNull();
  });

  it('clears an external profile image without calling Cloudinary', async () => {
    const user = await createUserWithProfile(
      'Funcionario',
      'delete-external@work-manager.local',
      '10000001251'
    );
    await prisma.user.update({
      where: { id: user.id },
      data: { profileImage: 'https://external.example/profile.webp' },
    });

    const response = await request(app)
      .delete(`/users/${user.id}/profile-image`)
      .set('Cookie', authCookieFor(user.id));

    expect(response.status).toBe(200);
    expect(deleteProfileImage).not.toHaveBeenCalled();

    const updatedUser = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    });
    expect(updatedUser.profileImage).toBeNull();
  });

  it('preserves the database references when Cloudinary deletion fails', async () => {
    const user = await createUserWithProfile(
      'Funcionario',
      'delete-failure@work-manager.local',
      '10000001332'
    );
    await prisma.user.update({
      where: { id: user.id },
      data: {
        profileImage: 'https://res.cloudinary.com/test/profile.webp',
        profileImagePublicId: 'profile-that-could-not-be-deleted',
      },
    });
    vi.mocked(deleteProfileImage).mockRejectedValue(
      new Error('Cloudinary unavailable')
    );

    const response = await request(app)
      .delete(`/users/${user.id}/profile-image`)
      .set('Cookie', authCookieFor(user.id));

    expect(response.status).toBe(500);

    const unchangedUser = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    });
    expect(unchangedUser.profileImagePublicId).toBe(
      'profile-that-could-not-be-deleted'
    );
  });

  it('forbids a non-Admin from removing another user profile image', async () => {
    const requester = await createUserWithProfile(
      'Funcionario',
      'delete-requester@work-manager.local',
      '10000001413'
    );
    const target = await createUserWithProfile(
      'Gerente',
      'delete-target@work-manager.local',
      '10000001502'
    );

    const response = await request(app)
      .delete(`/users/${target.id}/profile-image`)
      .set('Cookie', authCookieFor(requester.id));

    expect(response.status).toBe(403);
    expect(deleteProfileImage).not.toHaveBeenCalled();
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/config/cloudinary', () => ({
  cloudinary: {
    url: vi.fn(),
    uploader: {
      destroy: vi.fn(),
    },
    utils: {
      api_sign_request: vi.fn(),
      verify_api_response_signature: vi.fn(),
    },
  },
}));

import { cloudinary } from '../../src/config/cloudinary';
import { env } from '../../src/config/env';
import {
  buildProfileImageUrl,
  createProfileImageUploadSignature,
  deleteProfileImage,
  verifyProfileImageUploadResponse,
} from '../../src/services/cloudinaryService';

describe('Cloudinary service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a signed profile image upload payload', () => {
    vi.mocked(cloudinary.utils.api_sign_request).mockReturnValue(
      'signed-upload-value'
    );

    const result = createProfileImageUploadSignature(1_787_000_000);

    expect(cloudinary.utils.api_sign_request).toHaveBeenCalledWith(
      {
        timestamp: 1_787_000_000,
        upload_preset: 'work_manager_profile_images_dev',
      },
      env.cloudinaryApiSecret
    );
    expect(result).toEqual({
      apiKey: env.cloudinaryApiKey,
      cloudName: env.cloudinaryCloudName,
      signature: 'signed-upload-value',
      timestamp: 1_787_000_000,
      uploadPreset: 'work_manager_profile_images_dev',
    });
  });

  it.each(['ok', 'not found'])(
    'accepts the Cloudinary deletion result "%s"',
    async (deletionResult) => {
      vi.mocked(cloudinary.uploader.destroy).mockResolvedValue({
        result: deletionResult,
      });

      await expect(deleteProfileImage('users/profile-id')).resolves.toBe(
        undefined
      );
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(
        'users/profile-id',
        {
          invalidate: true,
          resource_type: 'image',
          type: 'upload',
        }
      );
    }
  );

  it('rejects an empty public ID without calling Cloudinary', async () => {
    await expect(deleteProfileImage('   ')).rejects.toThrow(
      'Profile image public ID is required'
    );
    expect(cloudinary.uploader.destroy).not.toHaveBeenCalled();
  });

  it('rejects an unexpected Cloudinary deletion result', async () => {
    vi.mocked(cloudinary.uploader.destroy).mockResolvedValue({
      result: 'error',
    });

    await expect(deleteProfileImage('users/profile-id')).rejects.toThrow(
      'Cloudinary could not delete the profile image'
    );
  });

  it('verifies the signature returned by Cloudinary after upload', () => {
    const verifyResponseSignature = vi.fn(() => true);
    Object.assign(cloudinary.utils, {
      verify_api_response_signature: verifyResponseSignature,
    });

    const result = verifyProfileImageUploadResponse({
      publicId: 'profile-id',
      signature: 'response-signature',
      version: 1_787_000_000,
    });

    expect(result).toBe(true);
    expect(verifyResponseSignature).toHaveBeenCalledWith(
      'profile-id',
      1_787_000_000,
      'response-signature'
    );
  });

  it('builds the profile image URL from trusted upload metadata', () => {
    vi.mocked(cloudinary.url).mockReturnValue(
      'https://res.cloudinary.com/test/image/upload/v1/profile-id.webp'
    );

    const result = buildProfileImageUrl({
      format: 'webp',
      publicId: 'profile-id',
      version: 1,
    });

    expect(result).toBe(
      'https://res.cloudinary.com/test/image/upload/v1/profile-id.webp'
    );
    expect(cloudinary.url).toHaveBeenCalledWith('profile-id', {
      format: 'webp',
      resource_type: 'image',
      secure: true,
      type: 'upload',
      version: 1,
    });
  });
});

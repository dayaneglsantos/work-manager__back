import { body, param } from 'express-validator';

const PROFILE_IMAGE_MAX_BYTES = 5_000_000; // 5 MB
const profileImageFormats = ['jpg', 'jpeg', 'png', 'webp']; // Formatos de imagem permitidos para upload de imagem de perfil

export const validateProfileImageTarget = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
];

export const validateProfileImageUploadConfirmation = [
  body('publicId')
    .isString()
    .withMessage('Public ID must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Public ID is required')
    .isLength({ max: 191 })
    .withMessage('Public ID must have at most 191 characters'),
  body('version')
    .isInt({ min: 1 })
    .withMessage('Version must be a positive integer')
    .toInt(),
  body('signature')
    .isString()
    .withMessage('Signature must be a string')
    .bail()
    .matches(/^[a-f0-9]{40,64}$/i)
    .withMessage('Signature has an invalid format'),
  body('resourceType')
    .equals('image')
    .withMessage('Resource type must be image'),
  body('format')
    .isString()
    .withMessage('Format must be a string')
    .bail()
    .customSanitizer((value: string) => value.toLowerCase())
    .isIn(profileImageFormats)
    .withMessage('Profile image format is not allowed'),
  body('bytes')
    .isInt({ min: 1, max: PROFILE_IMAGE_MAX_BYTES })
    .withMessage('Profile image must be at most 5 MB')
    .toInt(),
];

import { NextFunction, Request, Response } from 'express';
import {
  buildProfileImageUrl,
  createProfileImageUploadSignature,
  deleteProfileImage,
  verifyProfileImageUploadResponse,
} from '../services/cloudinaryService';
import prisma from '../services/prisma';

// Verifica se o usuário existe e retorna a assinatura de upload de imagem de perfil do Cloudinary
export const getProfileImageUploadSignature = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const targetUser = await prisma.user.findUnique({
      where: { id: Number(req.params.id) },
      select: { id: true },
    });

    if (!targetUser) {
      res.status(404).json({ error: 'There is no user with this id' });
      return;
    }

    res.status(200).json(createProfileImageUploadSignature());
  } catch (error) {
    next(error);
  }
};

// Confirma o upload da imagem de perfil do usuário, atualiza o banco de dados e remove a imagem anterior, se houver
export const confirmProfileImageUpload = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const targetUserId = Number(req.params.id);
  const { format, publicId, signature, version } = req.body;

  // Verifica a assinatura da resposta de upload de imagem de perfil do Cloudinary
  if (!verifyProfileImageUploadResponse({ publicId, signature, version })) {
    res.status(400).json({ error: 'Invalid Cloudinary upload response' });
    return;
  }

  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        profileImagePublicId: true,
      },
    });

    if (!currentUser) {
      res.status(404).json({ error: 'There is no user with this id' });
      return;
    }

    // Constrói a URL da imagem de perfil com base no formato, publicId e versão fornecidos
    const profileImage = buildProfileImageUrl({ format, publicId, version });

    try {
      await prisma.user.update({
        where: { id: targetUserId },
        data: {
          profileImage,
          profileImagePublicId: publicId,
        },
      });
    } catch (error) {
      // Se ocorrer um erro ao atualizar o banco de dados, tenta remover a imagem de perfil recém-carregada para evitar acúmulo de imagens não utilizadas
      try {
        await deleteProfileImage(publicId);
      } catch (cleanupError) {
        console.error(
          'Could not clean up the unlinked profile image',
          cleanupError
        );
      }

      throw error;
    }

    // Remove a imagem de perfil anterior, se houver, para evitar acúmulo de imagens não utilizadas
    if (
      currentUser.profileImagePublicId &&
      currentUser.profileImagePublicId !== publicId
    ) {
      try {
        await deleteProfileImage(currentUser.profileImagePublicId);
      } catch (cleanupError) {
        console.error(
          'Could not delete the previous profile image',
          cleanupError
        );
      }
    }

    res.status(200).json({
      id: targetUserId,
      profileImage,
    });
  } catch (error) {
    next(error);
  }
};

// Remove a imagem de perfil do Cloudinary, quando gerenciada pela aplicação, e limpa sua referência no usuário
export const removeProfileImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const targetUserId = Number(req.params.id);

  try {
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        profileImagePublicId: true,
      },
    });

    if (!targetUser) {
      res.status(404).json({ error: 'There is no user with this id' });
      return;
    }

    // Imagens antigas ou externas não possuem publicId e, por isso, apenas sua referência local é removida
    if (targetUser.profileImagePublicId) {
      await deleteProfileImage(targetUser.profileImagePublicId);
    }

    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        profileImage: null,
        profileImagePublicId: null,
      },
    });

    res.status(200).json({
      id: targetUserId,
      profileImage: null,
    });
  } catch (error) {
    next(error);
  }
};

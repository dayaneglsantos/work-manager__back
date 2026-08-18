import { NextFunction, Request, Response } from 'express';
import prisma from '../services/prisma';

const ADMIN_PROFILE_NAME = 'Admin';

// Verifica se o usuário autenticado tem permissão para atualizar a imagem de perfil do usuário alvo
// Permissões: admin ou próprio usuário
export const authorizeProfileImageUpdate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authenticatedUserId = req.user?.userId;
  const targetUserId = Number(req.params.id);

  if (!authenticatedUserId) {
    res.status(401).json({ error: 'Sessão inválida ou expirada.' });
    return;
  }

  if (authenticatedUserId === targetUserId) {
    next();
    return;
  }

  try {
    const authenticatedUser = await prisma.user.findUnique({
      where: { id: authenticatedUserId },
      select: {
        profile: {
          select: { name: true },
        },
      },
    });

    if (!authenticatedUser) {
      res.status(401).json({ error: 'Sessão inválida ou expirada.' });
      return;
    }

    if (authenticatedUser.profile.name !== ADMIN_PROFILE_NAME) {
      res.status(403).json({
        error: 'You do not have permission to update this profile image',
      });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};

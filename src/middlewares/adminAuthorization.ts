import { NextFunction, Request, Response } from 'express';
import prisma from '../services/prisma';

const ADMIN_PROFILE_NAME = 'Admin';

// Middleware para autorizar apenas usuários com perfil de administrador a acessar determinadas rotas
export const authorizeAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authenticatedUserId = req.user?.userId;

  if (!authenticatedUserId) {
    res.status(401).json({ error: 'Sessão inválida ou expirada.' });
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
        error: 'Você não tem permissão para reenviar este convite.',
      });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};

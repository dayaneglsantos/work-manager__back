import { NextFunction, Request, Response } from 'express';
import { hasPermission } from '../services/permissionService';
import prisma from '../services/prisma';

// Verifica se o usuário autenticado tem permissão para atualizar a imagem de perfil do usuário alvo
// Permissões: próprio usuário ou alguém com permissão para atualizar usuários.
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
    const targetOwner = await prisma.systemOwner.findUnique({
      where: { userId: targetUserId },
      select: { id: true },
    });

    if (targetOwner) {
      res.status(409).json({
        error: 'The system owner can only change their own profile image',
      });
      return;
    }

    if (!(await hasPermission(authenticatedUserId, 'update-users'))) {
      res.status(403).json({
        error: 'Você não tem permissão para atualizar esta imagem de perfil.',
        code: 'PERMISSION_DENIED',
        permission: 'update-users',
      });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};

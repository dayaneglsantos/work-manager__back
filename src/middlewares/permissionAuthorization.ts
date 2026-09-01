import { NextFunction, Request, Response } from 'express';
import { hasPermission } from '../services/permissionService';

export const authorizePermission = (permissionName: string) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
    }

    try {
      if (!(await hasPermission(userId, permissionName))) {
        return res.status(403).json({
          error: 'Você não tem permissão para executar esta ação.',
          code: 'PERMISSION_DENIED',
          permission: permissionName,
        });
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
};

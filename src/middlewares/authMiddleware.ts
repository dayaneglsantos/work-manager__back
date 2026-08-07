import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../services/prisma';
import { canAccessSystem } from '../services/employmentStatusService';
import { env } from '../config/env';
import { authCookieName, authCookieOptions } from '../config/authCookie';

const clearAuthCookie = (res: Response): void => {
  res.clearCookie(authCookieName, authCookieOptions);
};

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
  }

  let decoded: jwt.JwtPayload & { userId: number };

  try {
    const tokenPayload = jwt.verify(token, env.jwtSecret);

    // Se o payload do token não for um objeto ou não contiver a propriedade userId, o usuário não está autorizado
    if (
      typeof tokenPayload === 'string' ||
      !Number.isInteger(tokenPayload.userId)
    ) {
      clearAuthCookie(res);

      return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
    }

    decoded = tokenPayload as jwt.JwtPayload & { userId: number };
  } catch (err) {
    clearAuthCookie(res);

    return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
      select: {
        employmentStatus: true,
      },
    });

    if (!user || !canAccessSystem(user.employmentStatus)) {
      clearAuthCookie(res);

      return res.status(401).json({
        error: 'Seu acesso ao sistema não está disponível.',
        code: 'USER_ACCESS_REVOKED',
      });
    }

    req.user = decoded;
    return next();
  } catch (error) {
    return next(error);
  }
};

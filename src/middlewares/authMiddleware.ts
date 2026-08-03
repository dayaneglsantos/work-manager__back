import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../services/prisma';
import { canAccessSystem } from '../services/employmentStatusService';

const SECRET_KEY = process.env.JWT_SECRET || 'seu-segredo-aqui';

const clearAuthCookie = (res: Response): void => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
};

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  let decoded: jwt.JwtPayload & { userId: number };

  try {
    const tokenPayload = jwt.verify(token, SECRET_KEY);

    if (
      typeof tokenPayload === 'string' ||
      !Number.isInteger(tokenPayload.userId)
    ) {
      return res
        .status(403)
        .json({ error: 'Forbidden: Invalid token payload' });
    }

    decoded = tokenPayload as jwt.JwtPayload & { userId: number };
  } catch (err) {
    return res
      .status(403)
      .json({ error: 'Forbidden: Invalid or expired token' });
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
        error: 'Unauthorized: User does not have access to the system',
        code: 'USER_ACCESS_REVOKED',
      });
    }

    req.user = decoded;
    return next();
  } catch (error) {
    return next(error);
  }
};

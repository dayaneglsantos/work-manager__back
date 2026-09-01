import { Response, Request } from 'express';
import authenticateUser from '../services/authService';
import prisma from '../services/prisma';
import jwt from 'jsonwebtoken';
import { authCookieName, authCookieOptions } from '../config/authCookie';
import { getEffectivePermissions } from '../services/permissionService';

export const login = async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;

  try {
    const token = await authenticateUser(email, password);

    if (token) {
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          profileImage: true,
          profile: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      const userPermissions = user
        ? await getEffectivePermissions(user.id)
        : [];

      // Armazenando o token JWT em um cookie seguro
      res.cookie(authCookieName, token, {
        ...authCookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // Expira em 7 dias
        // maxAge: 60 * 1000, // expira em 1 minuto
      });

      return res.status(200).json({ ...user, permissions: userPermissions });
    } else {
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

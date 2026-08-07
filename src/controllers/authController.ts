import { Response, Request } from 'express';
import authenticateUser from '../services/authService';
import prisma from '../services/prisma';
import jwt from 'jsonwebtoken';
import { authCookieName, authCookieOptions } from '../config/authCookie';

export const login = async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;

  try {
    const token = await authenticateUser(email, password);

    if (token) {
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          profile: true,
          address: true,
          department: true,
        },
        omit: {
          password: true,
          createdAt: true,
          updatedAt: true,
          profileId: true,
          departmentId: true,
          supervisorId: true,
        },
      });

      const customPermissions = await prisma.customPermission.findMany({
        where: { userId: user?.id },
        include: {
          permission: true,
        },
      });

      const profilePermissions = await prisma.profilePermission.findMany({
        where: { profileId: user?.profile.id },
        include: {
          permission: true,
        },
      });

      const permissionsById = new Map<
        number,
        {
          name: string;
          hasPermission: boolean;
        }
      >();

      // Permissões do perfil
      for (const perm of profilePermissions) {
        permissionsById.set(perm.permissionId, {
          name: perm.permission.name,
          hasPermission: perm.hasPermission,
        });
      }

      // Exceções específicas do usuário (permissões personalizadas)
      // Como estão sendo armazenadas em um Map, se houver uma permissão personalizada para o usuário, ela substituirá a permissão do perfil ou adiciona permisssão personilizada que não existe na permissão do perfil.
      for (const customPerm of customPermissions) {
        permissionsById.set(customPerm.permissionId, {
          name: customPerm.permission.name,
          hasPermission: customPerm.hasPermission,
        });
      }

      const userPermissions = Array.from(permissionsById.values());

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

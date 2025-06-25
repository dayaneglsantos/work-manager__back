import { Response, Request } from 'express';
import authenticateUser from '../services/authService';
import prisma from '../services/prisma';

const login = async (req: Request, res: Response): Promise<any> => {
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
          currentSalary: true,
        },
      });

      const customPermission = await prisma.customPermission.findMany({
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

      let userPermissions = [];

      // Se existirem permissões personalizadas, elas terão prioridade sobre as permissões do perfil
      if (customPermission.length > 0) {
        const updatedPermissions = profilePermissions.map((perm) => {
          if (
            customPermission.some((cp) => cp.permissionId === perm.permissionId)
          ) {
            perm.hasPermission = !perm.hasPermission;
          }
          return perm;
        });
        userPermissions = updatedPermissions.map((profilePermission) => ({
          name: profilePermission.permission.name,
          hasPermission: profilePermission.hasPermission,
        }));
      } else {
        userPermissions = profilePermissions.map((profilePermission) => ({
          name: profilePermission.permission.name,
          hasPermission: profilePermission.hasPermission,
        }));
      }

      return res
        .status(200)
        .json({ token, permissions: userPermissions, ...user });
    } else {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default login;

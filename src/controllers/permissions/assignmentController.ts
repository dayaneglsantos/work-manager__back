import { Request, Response } from 'express';
import prisma from '../../services/prisma';

type ProfilePermissionInput = {
  permissionId: number;
  hasPermission: boolean;
};

type UserPermissionInput = {
  permissionId: number;
  customValue: boolean | null;
};

// Lista de permissões de um perfil específico, incluindo o valor efetivo da permissão com base no perfil e nas permissões personalizadas do usuário.
export const getProfilePermissionList = async (
  req: Request,
  res: Response
): Promise<any> => {
  const profileId = Number(req.params.profileId);

  try {
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      select: { id: true, name: true },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const permissions = await prisma.permission.findMany({
      orderBy: [{ type: { name: 'asc' } }, { action: { name: 'asc' } }],
      select: {
        id: true,
        name: true,
        type: { select: { name: true } },
        action: { select: { name: true } },
        permissions: {
          where: { profileId },
          select: { hasPermission: true },
        },
      },
    });

    return res.status(200).json({
      profile,
      permissions: permissions.map((permission) => ({
        permissionId: permission.id,
        name: permission.name,
        type: permission.type.name,
        action: permission.action.name,
        hasPermission: permission.permissions[0]?.hasPermission ?? false,
      })),
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Atualiza a lista de permissões de um perfil específico com base na entrada fornecida.
export const updateProfilePermissionList = async (
  req: Request,
  res: Response
): Promise<any> => {
  const profileId = Number(req.params.profileId);
  const permissions = req.body.permissions as ProfilePermissionInput[];

  try {
    await prisma.$transaction(async (transaction) => {
      const [profile, permissionCount] = await Promise.all([
        transaction.profile.findUnique({ where: { id: profileId } }),
        transaction.permission.count({
          where: {
            id: {
              in: permissions.map((permission) => permission.permissionId),
            },
          },
        }),
      ]);

      if (!profile) {
        throw new Error('PROFILE_NOT_FOUND');
      }

      if (permissionCount !== permissions.length) {
        throw new Error('PERMISSION_NOT_FOUND');
      }

      await Promise.all(
        permissions.map((permission) =>
          transaction.profilePermission.upsert({
            where: {
              profileId_permissionId: {
                profileId,
                permissionId: permission.permissionId,
              },
            },
            update: { hasPermission: permission.hasPermission },
            create: {
              profileId,
              permissionId: permission.permissionId,
              hasPermission: permission.hasPermission,
            },
          })
        )
      );
    });

    return getProfilePermissionList(req, res);
  } catch (error) {
    if (error instanceof Error && error.message === 'PROFILE_NOT_FOUND') {
      return res.status(404).json({ error: 'Profile not found' });
    }

    if (error instanceof Error && error.message === 'PERMISSION_NOT_FOUND') {
      return res
        .status(400)
        .json({ error: 'One or more permissions are invalid' });
    }

    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Lista de permissões de um usuário específico, incluindo o valor efetivo da permissão com base no perfil do usuário e nas permissões personalizadas.
export const getUserPermissionList = async (
  req: Request,
  res: Response
): Promise<any> => {
  const userId = Number(req.params.userId);

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        profile: { select: { id: true, name: true } },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const permissions = await prisma.permission.findMany({
      orderBy: [{ type: { name: 'asc' } }, { action: { name: 'asc' } }],
      select: {
        id: true,
        name: true,
        type: { select: { name: true } },
        action: { select: { name: true } },
        permissions: {
          where: { profileId: user.profile.id },
          select: { hasPermission: true },
        },
        customPermissions: {
          where: { userId },
          select: { hasPermission: true },
        },
      },
    });

    return res.status(200).json({
      user,
      permissions: permissions.map((permission) => {
        const profileValue = permission.permissions[0]?.hasPermission ?? false;
        const customValue =
          permission.customPermissions[0]?.hasPermission ?? null;

        return {
          permissionId: permission.id,
          name: permission.name,
          type: permission.type.name,
          action: permission.action.name,
          profileValue,
          customValue,
          effectiveValue: customValue ?? profileValue,
        };
      }),
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Atualiza a lista de permissões de um usuário específico com base na entrada fornecida.
export const updateUserPermissionList = async (
  req: Request,
  res: Response
): Promise<any> => {
  const userId = Number(req.params.userId);
  const permissions = req.body.permissions as UserPermissionInput[];

  try {
    await prisma.$transaction(async (transaction) => {
      const [user, permissionCount] = await Promise.all([
        transaction.user.findUnique({ where: { id: userId } }),
        transaction.permission.count({
          where: {
            id: {
              in: permissions.map((permission) => permission.permissionId),
            },
          },
        }),
      ]);

      if (!user) {
        throw new Error('USER_NOT_FOUND');
      }

      if (permissionCount !== permissions.length) {
        throw new Error('PERMISSION_NOT_FOUND');
      }

      await Promise.all(
        permissions.map((permission) => {
          const uniqueAssignment = {
            userId_permissionId: {
              userId,
              permissionId: permission.permissionId,
            },
          };

          if (permission.customValue === null) {
            return transaction.customPermission.deleteMany({
              where: uniqueAssignment.userId_permissionId,
            });
          }

          return transaction.customPermission.upsert({
            where: uniqueAssignment,
            update: { hasPermission: permission.customValue },
            create: {
              userId,
              permissionId: permission.permissionId,
              hasPermission: permission.customValue,
            },
          });
        })
      );
    });

    return getUserPermissionList(req, res);
  } catch (error) {
    if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({ error: 'User not found' });
    }

    if (error instanceof Error && error.message === 'PERMISSION_NOT_FOUND') {
      return res
        .status(400)
        .json({ error: 'One or more permissions are invalid' });
    }

    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

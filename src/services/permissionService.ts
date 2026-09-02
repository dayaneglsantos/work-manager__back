import prisma from './prisma';

export type EffectivePermission = {
  name: string;
  hasPermission: boolean;
};

export const getEffectivePermissions = async (
  userId: number
): Promise<EffectivePermission[]> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      profile: {
        select: {
          fullAccess: true,
          permissions: {
            include: { permission: true },
          },
        },
      },
      customPermissions: {
        include: { permission: true },
      },
      systemOwnership: { select: { id: true } },
    },
  });

  if (!user) {
    return [];
  }

  // Se o usuário tiver acesso total ou for proprietário do sistema, retorna todas as permissões com hasPermission = true
  if (user.profile.fullAccess || user.systemOwnership) {
    return prisma.permission
      .findMany({
        select: { name: true },
        orderBy: { id: 'asc' },
      })
      .then((permissions) =>
        permissions.map((permission) => ({
          name: permission.name,
          hasPermission: true,
        }))
      );
  }

  const permissionsById = new Map<number, EffectivePermission>();

  for (const profilePermission of user.profile.permissions) {
    permissionsById.set(profilePermission.permissionId, {
      name: profilePermission.permission.name,
      hasPermission: profilePermission.hasPermission,
    });
  }

  // Individual assignments override the permissions inherited from the profile.
  for (const customPermission of user.customPermissions) {
    permissionsById.set(customPermission.permissionId, {
      name: customPermission.permission.name,
      hasPermission: customPermission.hasPermission,
    });
  }

  return Array.from(permissionsById.values());
};

export const hasPermission = async (
  userId: number,
  permissionName: string
): Promise<boolean> => {
  const privilegedUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      profile: { select: { fullAccess: true } },
      systemOwnership: { select: { id: true } },
    },
  });

  // Se o usuário tiver acesso total ou for proprietário do sistema, retorna true
  if (privilegedUser?.profile.fullAccess || privilegedUser?.systemOwnership) {
    return true;
  }

  const permissions = await getEffectivePermissions(userId);

  return permissions.some(
    (permission) =>
      permission.name === permissionName && permission.hasPermission
  );
};

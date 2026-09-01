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
          permissions: {
            include: { permission: true },
          },
        },
      },
      customPermissions: {
        include: { permission: true },
      },
    },
  });

  if (!user) {
    return [];
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
  const permissions = await getEffectivePermissions(userId);

  return permissions.some(
    (permission) =>
      permission.name === permissionName && permission.hasPermission
  );
};

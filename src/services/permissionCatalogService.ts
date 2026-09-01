import { Permission, Prisma, PrismaClient } from '@prisma/client';
import { permissionCatalog } from '../config/permissionCatalog';

type DatabaseClient = PrismaClient | Prisma.TransactionClient;

export const syncPermissionCatalog = async (database: DatabaseClient) => {
  // Guarda as permissões sincronizadas para reutilização no seed e nas associações.
  const permissionsByName = new Map<string, Permission>();

  // Garante a existência de todos os tipos, ações e permissões do catálogo.
  for (const entry of permissionCatalog) {
    const type = await database.permissionType.upsert({
      where: { name: entry.type },
      update: {},
      create: { name: entry.type },
    });

    // Garante a existência das ações e das permissões formadas por ação + tipo.
    for (const actionName of entry.actions) {
      const action = await database.permissionAction.upsert({
        where: { name: actionName },
        update: {},
        create: { name: actionName },
      });
      const permissionName = `${actionName}-${entry.type}`;
      const permission = await database.permission.upsert({
        where: { name: permissionName },
        update: {
          actionId: action.id,
          typeId: type.id,
        },
        create: {
          name: permissionName,
          actionId: action.id,
          typeId: type.id,
        },
      });

      permissionsByName.set(permissionName, permission);
    }
  }

  // Garante que todos os perfis existentes tenham associações com todas as permissões do catálogo, com hasPermission definido como false por padrão.
  const profiles = await database.profile.findMany({ select: { id: true } });
  const assignments = profiles.flatMap((profile) =>
    Array.from(permissionsByName.values(), (permission) => ({
      profileId: profile.id,
      permissionId: permission.id,
      hasPermission: false,
    }))
  );

  // Se houver associações a serem criadas, insere-as no banco de dados, ignorando duplicatas.
  if (assignments.length > 0) {
    await database.profilePermission.createMany({
      data: assignments,
      skipDuplicates: true,
    });
  }

  return permissionsByName;
};

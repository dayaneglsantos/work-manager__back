import { PrismaClient } from '@prisma/client';
import { syncPermissionCatalog } from '../src/services/permissionCatalogService.ts';

const prisma = new PrismaClient();

// Sincroniza o catálogo de permissões com o banco de dados, garantindo que todos os tipos, ações e permissões estejam presentes e que todos os perfis existentes tenham associações com todas as permissões do catálogo.
try {
  await syncPermissionCatalog(prisma);
  console.log('Permission catalog synchronized successfully.');
} finally {
  await prisma.$disconnect();
}

import bcrypt from 'bcrypt';
import { EmploymentStatus } from '@prisma/client';
import prisma from '../../src/services/prisma';

export const TEST_EMAIL = 'auth-test@work-manager.local';
export const TEST_PASSWORD = 'test-password-123';

// Exclui primeiro as tabelas dependentes para respeitar as chaves estrangeiras.
// Cada teste começa sem herdar usuários, permissões ou tokens do teste anterior.
export const clearDatabase = async (): Promise<void> => {
  await prisma.passwordReset.deleteMany();
  await prisma.customPermission.deleteMany();
  await prisma.profilePermission.deleteMany();
  await prisma.user.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.permissionAction.deleteMany();
  await prisma.permissionType.deleteMany();
  await prisma.profile.deleteMany();
};

export const createTestUser = async (
  employmentStatus: EmploymentStatus = EmploymentStatus.active
) => {
  // Cada usuário precisa de um perfil. O nome único permite criar a fixture
  // repetidamente sem depender do seed usado no desenvolvimento.
  const profile = await prisma.profile.create({
    data: { name: `Test profile ${Date.now()}-${Math.random()}` },
  });

  return prisma.user.create({
    data: {
      name: 'Authentication Test User',
      email: TEST_EMAIL,
      // Um custo bcrypt menor deixa a suíte rápida sem alterar o código testado.
      password: await bcrypt.hash(TEST_PASSWORD, 4),
      admissionDate: new Date('2024-01-01'),
      employmentStatus,
      currentPosition: 'Tester',
      currentSalary: 1,
      profileId: profile.id,
    },
  });
};

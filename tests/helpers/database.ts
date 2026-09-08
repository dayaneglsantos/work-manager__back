import bcrypt from 'bcrypt';
import { EmploymentStatus } from '@prisma/client';
import prisma from '../../src/services/prisma';

export const TEST_EMAIL = 'auth-test@work-manager.local';
export const TEST_CPF = '10000000876';
export const TEST_PASSWORD = 'test-password-123';

// Exclui primeiro as tabelas dependentes para respeitar as chaves estrangeiras.
// Cada teste começa sem herdar usuários, permissões ou tokens do teste anterior.
export const clearDatabase = async (): Promise<void> => {
  await prisma.passwordReset.deleteMany();
  await prisma.systemOwner.deleteMany();
  await prisma.customPermission.deleteMany();
  await prisma.profilePermission.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.updateMany({ data: { departmentId: null } });
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.permissionAction.deleteMany();
  await prisma.permissionType.deleteMany();
  await prisma.profile.deleteMany();
};

// Cria um usuário de teste com um perfil associado, útil para testes de autenticação e autorização.
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
      cpf: TEST_CPF,
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

// Cria um perfil de teste com permissões associadas, útil para testes de autorização.
export const grantProfilePermissions = async (
  profileId: number,
  permissionNames: string[]
): Promise<void> => {
  for (const permissionName of permissionNames) {
    const [actionName, ...typeParts] = permissionName.split('-');
    const typeName = typeParts.join('-');
    const action = await prisma.permissionAction.upsert({
      where: { name: actionName },
      update: {},
      create: { name: actionName },
    });
    const type = await prisma.permissionType.upsert({
      where: { name: typeName },
      update: {},
      create: { name: typeName },
    });
    const permission = await prisma.permission.upsert({
      where: { name: permissionName },
      update: { actionId: action.id, typeId: type.id },
      create: {
        name: permissionName,
        actionId: action.id,
        typeId: type.id,
      },
    });

    await prisma.profilePermission.upsert({
      where: {
        profileId_permissionId: { profileId, permissionId: permission.id },
      },
      update: { hasPermission: true },
      create: {
        profileId,
        permissionId: permission.id,
        hasPermission: true,
      },
    });
  }
};

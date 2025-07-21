import { PrismaClient } from '@prisma/client';
import hashPassword from '../src/services/hashService.js';

const prisma = new PrismaClient();

async function main() {
  // =================================== PROFILES ===================================
  const adminProfile = await prisma.profile.create({
    data: { name: 'Admin' },
  });

  const gerenteProfile = await prisma.profile.create({
    data: { name: 'Gerente' },
  });

  const supervisorProfile = await prisma.profile.create({
    data: { name: 'Supervisor' },
  });

  const funcionarioProfile = await prisma.profile.create({
    data: { name: 'Funcionario' },
  });

  // =================================== USERS ===================================
  const admin = await prisma.user.create({
    data: {
      name: 'Master Admin',
      email: 'admin@teste.com',
      password: await hashPassword('admin123'),
      admissionDate: new Date('2023-01-01'),
      employmentStatus: 'active',
      currentPosition: 'Administrator',
      currentSalary: 5000,
      profileImage: 'https://example.com/profile-image.jpg',
      profileId: adminProfile.id,
      phoneNumber: '61999999999',
      address: {
        create: {
          street: 'Rua Exemplo',
          city: 'Brasília',
          state: 'DF',
          zipCode: '70000-000',
          number: 1,
        },
      },
    },
  });
  const gerente = await prisma.user.create({
    data: {
      name: 'Gerente',
      email: 'gerente@teste.com',
      password: await hashPassword('gerente123'),
      admissionDate: new Date('2023-01-01'),
      employmentStatus: 'active',
      currentPosition: 'Gerente',
      currentSalary: 3000,
      profileImage: 'https://example.com/profile-image.jpg',
      profileId: gerenteProfile.id,
      phoneNumber: '61999999999',
      address: {
        create: {
          street: 'Rua Teste',
          city: 'Brasília',
          state: 'DF',
          zipCode: '70000-000',
          number: 2,
        },
      },
    },
  });
  const supervisor = await prisma.user.create({
    data: {
      name: 'Supervisor',
      email: 'supervisor@teste.com',
      password: await hashPassword('supervisor123'),
      admissionDate: new Date('2023-01-01'),
      employmentStatus: 'active',
      currentPosition: 'Supervisor',
      currentSalary: 3000,
      profileImage: 'https://example.com/profile-image.jpg',
      profileId: supervisorProfile.id,
      phoneNumber: '61999999999',
    },
  });
  const funcionario = await prisma.user.create({
    data: {
      name: 'Funcionario',
      email: 'funcionario@teste.com',
      password: await hashPassword('funcionario123'),
      admissionDate: new Date('2023-01-01'),
      employmentStatus: 'active',
      currentPosition: 'Funcionario',
      currentSalary: 3000,
      profileImage: 'https://example.com/profile-image.jpg',
      profileId: funcionarioProfile.id,
      phoneNumber: '61999999999',
    },
  });

  // =================================== DEPARTMENTS ===================================
  await prisma.department.createMany({
    data: [
      {
        name: 'RH',
        managerId: gerente.id,
      },
      {
        name: 'TI',
        managerId: supervisor.id,
      },
      {
        name: 'Financeiro',
        managerId: admin.id,
      },
    ],
  });

  // =================================== PERMISSION ACTIONS ===================================
  const createPermissionAction = await prisma.permissionAction.create({
    data: { name: 'create' },
  });
  const readPermissionAction = await prisma.permissionAction.create({
    data: { name: 'read' },
  });
  const updatePermissionAction = await prisma.permissionAction.create({
    data: { name: 'update' },
  });
  const deletePermissionAction = await prisma.permissionAction.create({
    data: { name: 'delete' },
  });

  // =================================== PERMISSION TYPES ===================================
  const userPermissionType = await prisma.permissionType.create({
    data: { name: 'users' },
  });
  const ddepartmentPermissionType = await prisma.permissionType.create({
    data: { name: 'departments' },
  });
  const profilePermissionType = await prisma.permissionType.create({
    data: { name: 'profiles' },
  });

  // =================================== PERMISSION ===================================
  const createUserPermission = await prisma.permission.create({
    data: {
      actionId: createPermissionAction.id, // create
      typeId: userPermissionType.id, // users
      name: 'create-users',
    },
  });

  const readUserPermission = await prisma.permission.create({
    data: {
      actionId: readPermissionAction.id, // read
      typeId: userPermissionType.id, // users
      name: 'read-users',
    },
  });

  const updateUserPermission = await prisma.permission.create({
    data: {
      actionId: updatePermissionAction.id, // update
      typeId: userPermissionType.id, // users
      name: 'update-users',
    },
  });

  const deleteUserPermission = await prisma.permission.create({
    data: {
      actionId: deletePermissionAction.id, // delete
      typeId: userPermissionType.id, // users
      name: 'delete-users',
    },
  });
  const createDepartmentPermission = await prisma.permission.create({
    data: {
      actionId: createPermissionAction.id, // create
      typeId: ddepartmentPermissionType.id, // departments
      name: 'create-departments',
    },
  });
  const readDepartmentPermission = await prisma.permission.create({
    data: {
      actionId: readPermissionAction.id, // read
      typeId: ddepartmentPermissionType.id, // departments
      name: 'read-departments',
    },
  });
  const updateDepartmentPermission = await prisma.permission.create({
    data: {
      actionId: updatePermissionAction.id, // update
      typeId: ddepartmentPermissionType.id, // departments
      name: 'update-departments',
    },
  });
  const deleteDepartmentPermission = await prisma.permission.create({
    data: {
      actionId: deletePermissionAction.id, // delete
      typeId: ddepartmentPermissionType.id, // departments
      name: 'delete-departments',
    },
  });
  const createProfilePermission = await prisma.permission.create({
    data: {
      actionId: createPermissionAction.id, // create
      typeId: profilePermissionType.id, // profiles
      name: 'create-profiles',
    },
  });
  const readProfilePermission = await prisma.permission.create({
    data: {
      actionId: readPermissionAction.id, // read
      typeId: profilePermissionType.id, // profiles
      name: 'read-profiles',
    },
  });
  const updateProfilePermission = await prisma.permission.create({
    data: {
      actionId: updatePermissionAction.id, // update
      typeId: profilePermissionType.id, // profiles
      name: 'update-profiles',
    },
  });
  const deleteProfilePermission = await prisma.permission.create({
    data: {
      actionId: deletePermissionAction.id, // delete
      typeId: profilePermissionType.id, // profiles
      name: 'delete-profiles',
    },
  });

  // =================================== PROFILE PERMISSIONS ===================================
  const adminPermissions = await prisma.profilePermission.createMany({
    data: [
      {
        profileId: adminProfile.id,
        permissionId: createUserPermission.id, // create users
        hasPermission: true,
      },
      {
        profileId: adminProfile.id,
        permissionId: readUserPermission.id, // read users
        hasPermission: true,
      },
      {
        profileId: adminProfile.id,
        permissionId: updateUserPermission.id, // update users
        hasPermission: true,
      },
      {
        profileId: adminProfile.id,
        permissionId: deleteUserPermission.id, // delete users
        hasPermission: true,
      },
    ],
  });

  // =================================== CUSTOM PERMISSIONS ===================================
  await prisma.customPermission.createMany({
    data: [
      {
        userId: admin.id, // Master Admin
        permissionId: createUserPermission.id, // create users
        hasPermission: false,
      },
    ],
  });

  // =================================== TAGS ===================================
  await prisma.tag.createMany({
    data: [{ name: 'Tag 1' }, { name: 'Tag 2' }, { name: 'Tag 3' }],
  });
  // =================================== TASKS ===================================
  const task1 = await prisma.task.create({
    data: {
      title: 'Task 1',
      description: 'This is the first task.',
      priority: 'medium',
      assigneeId: admin.id,
      creatorId: supervisor.id,
    },
  });

  // =================================== COMMENTS ===================================
  const comment1 = await prisma.comment.create({
    data: {
      content: 'This is a comment on the user.',
      authorId: admin.id,
      referenceId: task1.id,
      referenceType: 'task',
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

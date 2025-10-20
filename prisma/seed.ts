import { PrismaClient } from '@prisma/client';
import hashPassword from '../src/services/hashService.ts';

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
      admissionDate: new Date('2019-02-01'),
      employmentStatus: 'active',
      currentPosition: 'Administrator',
      currentSalary: 14500,
      profileImage:
        'https://image.lexica.art/full_webp/8ccd1a91-edbe-4599-8485-ecc3d4d138ca',
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
      admissionDate: new Date('2023-03-01'),
      employmentStatus: 'active',
      currentPosition: 'Gerente',
      currentSalary: 8700,
      profileImage:
        'https://image.lexica.art/full_webp/4940ade4-3a3f-442e-8736-5309127fb693',
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
  const gerente2 = await prisma.user.create({
    data: {
      name: 'Gerente 2',
      email: 'gerente2@teste.com',
      password: await hashPassword('gerente123'),
      admissionDate: new Date('2022-07-01'),
      employmentStatus: 'active',
      currentPosition: 'Gerente',
      currentSalary: 5300,
      profileImage:
        'https://image.lexica.art/full_webp/9ad9f83f-eedd-4aa2-b3e6-b3a7b26a0074',
      profileId: gerenteProfile.id,
      phoneNumber: '61999999999',
      address: {
        create: {
          street: 'Rua Teste 2',
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
      admissionDate: new Date('2023-11-01'),
      employmentStatus: 'active',
      currentPosition: 'Supervisor',
      currentSalary: 4900,
      profileImage:
        'https://image.lexica.art/full_webp/3d8d075c-4c51-4c0e-a188-4f211e54f8cc',
      profileId: supervisorProfile.id,
      phoneNumber: '61999999999',
    },
  });
  const supervisor2 = await prisma.user.create({
    data: {
      name: 'Supervisor 2',
      email: 'supervisor2@teste.com',
      password: await hashPassword('supervisor123'),
      admissionDate: new Date('2023-02-01'),
      employmentStatus: 'active',
      currentPosition: 'Supervisor',
      currentSalary: 5200,
      profileImage:
        'https://image.lexica.art/full_webp/6f7f759c-d970-489e-85d3-4bbac915a8d4',
      profileId: supervisorProfile.id,
      phoneNumber: '61999999999',
    },
  });
  const funcionario = await prisma.user.create({
    data: {
      name: 'Funcionario',
      email: 'funcionario@teste.com',
      password: await hashPassword('funcionario123'),
      admissionDate: new Date('2025-05-01'),
      employmentStatus: 'active',
      currentPosition: 'Funcionario',
      currentSalary: 3500,
      profileImage:
        'https://image.lexica.art/full_webp/68cb112a-eec3-439e-928b-b7ba500b1227',
      profileId: funcionarioProfile.id,
      phoneNumber: '61999999999',
    },
  });
  const funcionario2 = await prisma.user.create({
    data: {
      name: 'Funcionario 2',
      email: 'funcionario2@teste.com',
      password: await hashPassword('funcionario123'),
      admissionDate: new Date('2024-08-01'),
      employmentStatus: 'active',
      currentPosition: 'Funcionario',
      currentSalary: 3200,
      profileImage:
        'https://image.lexica.art/full_webp/056d40c5-3c18-44b2-b720-00fdb70cb52c',
      profileId: funcionarioProfile.id,
      phoneNumber: '61999999999',
    },
  });

  // =================================== DEPARTMENTS ===================================
  const rhDepartment = await prisma.department.create({
    data: {
      name: 'RH',
      managerId: gerente.id,
    },
  });

  const tiDepartment = await prisma.department.create({
    data: {
      name: 'TI',
      managerId: supervisor.id,
    },
  });
  const financeiroDepartment = await prisma.department.create({
    data: {
      name: 'Financeiro',
      managerId: admin.id,
    },
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
  const departmentPermissionType = await prisma.permissionType.create({
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
      typeId: departmentPermissionType.id, // departments
      name: 'create-departments',
    },
  });
  const readDepartmentPermission = await prisma.permission.create({
    data: {
      actionId: readPermissionAction.id, // read
      typeId: departmentPermissionType.id, // departments
      name: 'read-departments',
    },
  });
  const updateDepartmentPermission = await prisma.permission.create({
    data: {
      actionId: updatePermissionAction.id, // update
      typeId: departmentPermissionType.id, // departments
      name: 'update-departments',
    },
  });
  const deleteDepartmentPermission = await prisma.permission.create({
    data: {
      actionId: deletePermissionAction.id, // delete
      typeId: departmentPermissionType.id, // departments
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
      deadline: new Date('2025-07-01'),
    },
  });
  const task2 = await prisma.task.create({
    data: {
      title: 'Task 2',
      description: 'This is the second task.',
      priority: 'high',
      assigneeId: admin.id,
      creatorId: funcionario.id,
      departmentId: rhDepartment.id,
      deadline: new Date('2025-11-10'),
    },
  });
  const task3 = await prisma.task.create({
    data: {
      title: 'Task 3',
      description: 'This is the third task.',
      priority: 'low',
      assigneeId: supervisor2.id,
      creatorId: admin.id,
      departmentId: tiDepartment.id,
      blockedBy: task2.id,
    },
  });
  const task4 = await prisma.task.create({
    data: {
      title: 'Task 4',
      description: 'This is the fourth task.',
      assigneeId: funcionario2.id,
      creatorId: supervisor.id,
      departmentId: financeiroDepartment.id,
      parentTaskId: task1.id,
    },
  });
  const task5 = await prisma.task.create({
    data: {
      title: 'Task 5',
      description: 'This is the fifth task.',
      assigneeId: funcionario.id,
      creatorId: supervisor2.id,
      departmentId: financeiroDepartment.id,
    },
  });
  const task6 = await prisma.task.create({
    data: {
      title: 'Task 6',
      description: 'This is the sixth task.',
      assigneeId: funcionario2.id,
      creatorId: gerente2.id,
      departmentId: financeiroDepartment.id,
    },
  });
  const task7 = await prisma.task.create({
    data: {
      title: 'Task 7',
      description: 'This is the seventh task.',
      assigneeId: funcionario.id,
      creatorId: gerente2.id,
      departmentId: financeiroDepartment.id,
    },
  });
  const task8 = await prisma.task.create({
    data: {
      title: 'Task 8',
      description: 'This is the eighth task.',
      assigneeId: supervisor2.id,
      creatorId: gerente.id,
      departmentId: financeiroDepartment.id,
    },
  });
  const task9 = await prisma.task.create({
    data: {
      title: 'Task 9',
      description: 'This is the ninth task.',
      assigneeId: supervisor.id,
      creatorId: gerente2.id,
      departmentId: financeiroDepartment.id,
    },
  });
  const task10 = await prisma.task.create({
    data: {
      title: 'Task 10',
      description: 'This is the tenth task.',
      assigneeId: supervisor.id,
      creatorId: admin.id,
      departmentId: financeiroDepartment.id,
    },
  });
  const task11 = await prisma.task.create({
    data: {
      title: 'Task 11',
      description: 'This is the eleventh task.',
      assigneeId: funcionario2.id,
      creatorId: admin.id,
      departmentId: financeiroDepartment.id,
    },
  });

  // =================================== COMMENTS ===================================
  const comment1 = await prisma.comment.create({
    data: {
      content: 'This is a comment on the user.',
      authorId: admin.id,
      taskId: task1.id,
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

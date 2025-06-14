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
  await prisma.user.create({
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
  await prisma.user.create({
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
  await prisma.user.create({
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
  await prisma.user.create({
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
        managerId: 1,
      },
      {
        name: 'TI',
        managerId: 2,
      },
      {
        name: 'Financeiro',
        managerId: 3,
      },
    ],
  });

  // =================================== PERMISSION ACTIONS ===================================
  await prisma.permissionAction.createMany({
    data: [
      { name: 'create' },
      { name: 'read' },
      { name: 'update' },
      { name: 'delete' },
    ],
  });

  // =================================== PERMISSION ACTIONS ===================================
  await prisma.permissionType.createMany({
    data: [{ name: 'users' }, { name: 'departments' }, { name: 'profiles' }],
  });

  // =================================== PERMISSION ACTIONS ===================================
  await prisma.permission.createMany({
    data: [
      {
        actionId: 1, // create
        typeId: 1, // users
        name: 'create-users',
      },
      {
        actionId: 2, // read
        typeId: 1, // users
        name: 'read-users',
      },
      {
        actionId: 3, // update
        typeId: 1, // users
        name: 'update-users',
      },
      {
        actionId: 4, // delete
        typeId: 1, // users
        name: 'delete-users',
      },
      {
        actionId: 1, // create
        typeId: 2, // departments
        name: 'create-departments',
      },
      {
        actionId: 2, // read
        typeId: 2, // departments
        name: 'read-departments',
      },
      {
        actionId: 3, // update
        typeId: 2, // departments
        name: 'update-departments',
      },
      {
        actionId: 4, // delete
        typeId: 2, // departments
        name: 'delete-departments',
      },
      {
        actionId: 1, // create
        typeId: 3, // profiles
        name: 'create-profiles',
      },
      {
        actionId: 2, // read
        typeId: 3, // profiles
        name: 'read-profiles',
      },
      {
        actionId: 3, // update
        typeId: 3, // profiles
        name: 'update-profiles',
      },
      {
        actionId: 4, // delete
        typeId: 3, // profiles
        name: 'delete-profiles',
      },
    ],
  });

  // =================================== PROFILE PERMISSIONS ===================================
  await prisma.profilePermission.createMany({
    data: [
      {
        profileId: adminProfile.id,
        permissionId: 1, // create users
        hasPermission: true,
      },
      {
        profileId: adminProfile.id,
        permissionId: 2, // read users
        hasPermission: true,
      },
      {
        profileId: adminProfile.id,
        permissionId: 3, // update users
        hasPermission: true,
      },
      {
        profileId: adminProfile.id,
        permissionId: 4, // delete users
        hasPermission: true,
      },
      {
        profileId: gerenteProfile.id,
        permissionId: 2, // read users
        hasPermission: true,
      },
      {
        profileId: gerenteProfile.id,
        permissionId: 3, // update users
        hasPermission: true,
      },
      {
        profileId: supervisorProfile.id,
        permissionId: 2, // read users
        hasPermission: true,
      },
      {
        profileId: funcionarioProfile.id,
        permissionId: 2, // read users
        hasPermission: true,
      },
    ],
  });

  // =================================== CUSTOM PERMISSIONS ===================================
  await prisma.customPermission.createMany({
    data: [
      {
        userId: 1, // Master Admin
        permissionId: 1, // create users
        hasPermission: false,
      },
    ],
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

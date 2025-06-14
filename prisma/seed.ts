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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

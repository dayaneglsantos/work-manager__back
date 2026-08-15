import { NextFunction, Request, Response } from 'express';
import hashPassword from '../services/hashService';
import prisma from '../services/prisma';
import { EmploymentStatus } from '@prisma/client';
import { buildUpdateData } from '../services/buildUpdateData';
import { normalizeStatusReason } from '../services/employmentStatusService';

const userFields = [
  'name',
  'email',
  'phoneNumber',
  'birthDate',
  'profileImage',
  'password',
  'profileId',
  'supervisorId',
  'departmentId',
  'currentSalary',
  'admissionDate',
  'currentPosition',
  'employmentStatus',
  'statusReason',
  'notes',
  'address',
];

const addressFields = [
  'zipCode',
  'state',
  'city',
  'street',
  'number',
  'complement',
];

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const {
    name,
    email,
    phoneNumber,
    address,
    birthDate,
    password,
    profileImage,
    profileId,
    supervisorId,
    departmentId,
    currentPosition,
    currentSalary,
    admissionDate,
    employmentStatus,
    statusReason,
    notes,
  } = req.body;

  const resolvedEmploymentStatus = employmentStatus ?? EmploymentStatus.active;
  const normalizedStatusReason = normalizeStatusReason(
    resolvedEmploymentStatus,
    statusReason
  );

  if (
    resolvedEmploymentStatus === EmploymentStatus.inactive &&
    !normalizedStatusReason
  ) {
    return res
      .status(400)
      .json({ error: 'Status reason is required for inactive users' });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: 'There is already a registered user with this email.' });
    }

    if (departmentId) {
      const existingDepartment = await prisma.department.findUnique({
        where: {
          id: departmentId,
        },
      });

      if (!existingDepartment) {
        return res.status(400).json({ error: 'Invalid department ID.' });
      }
    }

    if (profileId) {
      const existingProfile = await prisma.profile.findUnique({
        where: {
          id: profileId,
        },
      });

      if (!existingProfile) {
        return res.status(400).json({ error: 'Invalid profile ID.' });
      }
    }

    if (supervisorId) {
      const existingSupervisor = await prisma.user.findUnique({
        where: {
          id: supervisorId,
        },
      });

      if (!existingSupervisor) {
        return res.status(400).json({ error: 'Invalid supervisor ID.' });
      }
    }

    const hashedPassword = await hashPassword(password);
    if (!hashedPassword) {
      throw new Error('Failed to hash the password');
    }

    const userData = {
      name,
      email,
      phoneNumber,
      birthDate,
      profileImage,
      employmentStatus: resolvedEmploymentStatus,
      statusReason: normalizedStatusReason,
      notes,
      currentPosition,
      currentSalary,
      admissionDate: new Date(admissionDate),
      profile: { connect: { id: profileId } },
      supervisor: supervisorId ? { connect: { id: supervisorId } } : undefined,
      ...(address && {
        address: {
          create: address,
        },
      }),
      password: hashedPassword,
      ...(departmentId && { department: { connect: { id: departmentId } } }),
    };

    const newUser = await prisma.user.create({
      data: userData,
    });

    return res.status(201).json(newUser);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ----------------------------------------------------------------

export const getUserById = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        address: true,
        profile: true,
        supervisor: true,
        department: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'There is no user with this id' });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ----------------------------------------------------------------

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { departmentId, search, employmentStatus } = req.query;
  const filters: any = {};

  if (departmentId) {
    filters.departmentId = Number(departmentId);
  }
  if (search) {
    filters.OR = [{ name: { contains: search } }];
  }
  if (employmentStatus) {
    filters.employmentStatus = employmentStatus as EmploymentStatus;
  }

  // Paginação
  const page = req.query.page ? Number(req.query.page) : undefined;
  const pageSize = req.query.pageSize ? Number(req.query.pageSize) : undefined;
  const skip = page && pageSize ? (page - 1) * pageSize : undefined; // Calcular o número de registros a pular
  const take = pageSize; // Número de registros a retornar

  try {
    const totalCount = await prisma.user.count({
      where: filters,
    });
    const users = await prisma.user.findMany({
      skip,
      take,
      where: filters,
      include: {
        address: {
          omit: {
            userId: true,
            id: true,
          },
        },
        profile: true,
        supervisor: true,
        department: true,
      },
      omit: {
        password: true,
        departmentId: true,
        profileId: true,
        supervisorId: true,
      },
    });

    let response;
    if (page && pageSize) {
      response = {
        data: users,
        meta: {
          page, // Página atual
          pageSize, // Tamanho da página
          totalCount, // Total de registros
          totalPages: Math.ceil(totalCount / pageSize), // Total de páginas
          hasNextPage: skip! + take! < totalCount, // Se há próxima página
          hasPreviousPage: page > 1, // Se há página anterior
        },
      };
    } else {
      response = {
        data: users,
        meta: {
          totalCount,
        },
      };
    }

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ----------------------------------------------------------------

export const partialUpdateUser = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;
  const { address } = req.body;

  const fieldsToUpdate = buildUpdateData(req.body, userFields);

  // Atualiza o endereço existente ou cria um novo quando o usuário ainda não possui um.
  if (address) {
    fieldsToUpdate.address = {
      upsert: {
        create: address,
        update: address,
      },
    };
  }

  if (Object.keys(fieldsToUpdate).length > 0) {
    try {
      const isUpdatingEmploymentStatus =
        'employmentStatus' in fieldsToUpdate ||
        'statusReason' in fieldsToUpdate;

      if (isUpdatingEmploymentStatus) {
        const currentUser = await prisma.user.findUnique({
          where: {
            id: Number(id),
          },
          select: {
            employmentStatus: true,
            statusReason: true,
          },
        });

        if (!currentUser) {
          return res
            .status(404)
            .json({ error: 'There is no user with this id' });
        }

        const resolvedEmploymentStatus =
          fieldsToUpdate.employmentStatus ?? currentUser.employmentStatus;
        const resolvedStatusReason =
          'statusReason' in fieldsToUpdate
            ? fieldsToUpdate.statusReason
            : currentUser.statusReason;
        const normalizedStatusReason = normalizeStatusReason(
          resolvedEmploymentStatus,
          resolvedStatusReason
        );

        if (
          resolvedEmploymentStatus === EmploymentStatus.inactive &&
          !normalizedStatusReason
        ) {
          return res
            .status(400)
            .json({ error: 'Status reason is required for inactive users' });
        }

        fieldsToUpdate.statusReason = normalizedStatusReason;
      }

      const user = await prisma.user.update({
        where: {
          id: Number(id),
        },
        data: fieldsToUpdate,
      });

      if (!user) {
        return res.status(404).json({ error: 'There is no user with this id' });
      }

      const updatedUser = await prisma.user.findUnique({
        where: {
          id: Number(id),
        },
        include: {
          address: {
            omit: {
              userId: true,
              id: true,
            },
          },
          profile: true,
          supervisor: true,
          department: true,
        },
        omit: {
          password: true,
        },
      });

      return res.status(200).json(updatedUser);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    return res.status(400).json({ error: 'No fields to update' });
  }
};

// ----------------------------------------------------------------

export const fullUpdateUser = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const missingFields = userFields.filter(
    (field) => field !== 'statusReason' && !(field in req.body)
  );
  const missingAddressFields = req.body.address
    ? addressFields.filter((field) => !(field in req.body.address))
    : [];

  if (missingFields.length > 0 || missingAddressFields.length > 0) {
    return res.status(400).json({
      error: `Missing fields: ${[...missingFields, ...missingAddressFields].join(', ')}`,
    });
  }

  const normalizedStatusReason = normalizeStatusReason(
    req.body.employmentStatus,
    req.body.statusReason
  );

  if (
    req.body.employmentStatus === EmploymentStatus.inactive &&
    !normalizedStatusReason
  ) {
    return res
      .status(400)
      .json({ error: 'Status reason is required for inactive users' });
  }

  const fieldsToUpdate = {
    ...req.body,
    statusReason: normalizedStatusReason,
    address: {
      update: req.body.address,
    },
  };

  try {
    const user = await prisma.user.update({
      where: {
        id: Number(id),
      },
      data: fieldsToUpdate,
    });

    if (!user) {
      return res.status(404).json({ error: 'There is no user with this id' });
    }

    const updatedUser = await prisma.user.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        address: {
          omit: {
            userId: true,
            id: true,
          },
        },
        profile: true,
        supervisor: true,
        department: true,
      },
      omit: {
        password: true,
      },
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ----------------------------------------------------------------

export const deleteUser = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;

  try {
    await prisma.address.delete({
      where: {
        userId: Number(id),
      },
    });
    const user = await prisma.user.delete({
      where: {
        id: Number(id),
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'There is no user with this id' });
    }

    return res.status(201).json({ message: 'User deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

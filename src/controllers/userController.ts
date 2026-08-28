import { NextFunction, Request, Response } from 'express';
import prisma from '../services/prisma';
import { EmploymentStatus } from '@prisma/client';
import { buildUpdateData } from '../services/buildUpdateData';
import { normalizeStatusReason } from '../services/employmentStatusService';
import { parseDateOnly } from '../utils/dateOnly';
import { deleteProfileImage } from '../services/cloudinaryService';
import { sendPasswordCreationInvitation } from '../services/passwordCreationInvitationService';

const userFields = [
  'name',
  'email',
  'cpf',
  'phoneNumber',
  'birthDate',
  'password',
  'profileId',
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
    cpf,
    phoneNumber,
    address,
    birthDate,
    profileId,
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
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { cpf }],
      },
    });

    if (existingUser) {
      const duplicatedField = existingUser.email === email ? 'email' : 'CPF';

      return res.status(400).json({
        error: `There is already a registered user with this ${duplicatedField}.`,
      });
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

    const userData = {
      name,
      email,
      cpf,
      phoneNumber,
      birthDate: birthDate ? parseDateOnly(birthDate) : undefined,
      employmentStatus: resolvedEmploymentStatus,
      statusReason: normalizedStatusReason,
      notes,
      currentPosition,
      currentSalary,
      admissionDate: parseDateOnly(admissionDate),
      profile: { connect: { id: profileId } },
      ...(address && {
        address: {
          create: address,
        },
      }),
      password: null,
      ...(departmentId && { department: { connect: { id: departmentId } } }),
    };

    const newUser = await prisma.user.create({ data: userData });
    const invitationSent = await sendPasswordCreationInvitation(newUser);

    const { password: _password, ...userWithoutPassword } = newUser;

    return res.status(201).json({
      ...userWithoutPassword,
      invitationSent,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ---------------------------- Reenvio de Convite ------------------------------------

export const resendPasswordCreationInvitation = async (
  req: Request,
  res: Response
): Promise<any> => {
  const userId = Number(req.params.id);

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    if (user.password) {
      return res.status(409).json({
        error: 'Este usuário já criou sua senha.',
      });
    }

    const invitationSent = await sendPasswordCreationInvitation(user);

    if (!invitationSent) {
      return res.status(502).json({
        error: 'Não foi possível enviar o convite. Tente novamente mais tarde.',
      });
    }

    return res.status(200).json({
      message: 'Convite reenviado com sucesso.',
    });
  } catch (error) {
    console.error('Erro ao reenviar o convite de criação de senha.', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
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
        department: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'There is no user with this id' });
    }

    const { password, ...userWithoutPassword } = user;

    return res.status(200).json({
      ...userWithoutPassword,
      hasPassword: password !== null,
    });
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
        department: true,
      },
      omit: {
        cpf: true,
        departmentId: true,
        profileId: true,
      },
    });
    const usersWithPasswordStatus = users.map(({ password, ...user }) => ({
      ...user,
      hasPassword: password !== null,
    }));

    let response;
    if (page && pageSize) {
      response = {
        data: usersWithPasswordStatus,
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
        data: usersWithPasswordStatus,
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

  if (fieldsToUpdate.birthDate) {
    fieldsToUpdate.birthDate = parseDateOnly(fieldsToUpdate.birthDate);
  }

  if (fieldsToUpdate.admissionDate) {
    fieldsToUpdate.admissionDate = parseDateOnly(fieldsToUpdate.admissionDate);
  }

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
    birthDate: req.body.birthDate ? parseDateOnly(req.body.birthDate) : null,
    admissionDate: parseDateOnly(req.body.admissionDate),
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
  const userId = Number(id);

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        profileImagePublicId: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'There is no user with this id' });
    }

    // A imagem é removida antes do usuário para preservar seu publicId caso o Cloudinary esteja indisponível
    if (user.profileImagePublicId) {
      await deleteProfileImage(user.profileImagePublicId);
    }

    await prisma.$transaction([
      // O endereço é opcional, portanto a ausência dele não deve impedir a exclusão do usuário
      prisma.address.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);

    return res.status(201).json({ message: 'User deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

import bcrypt from 'bcrypt';
import { Request, Response } from 'express';

import hashPassword from '../services/hashService';
import prisma from '../services/prisma';
import { parseDateOnly } from '../utils/dateOnly';

const selfProfileSelect = {
  id: true,
  name: true,
  email: true,
  cpf: true,
  phoneNumber: true,
  birthDate: true,
  profileImage: true,
  profile: {
    select: {
      id: true,
      name: true,
      fullAccess: true,
    },
  },
  systemOwnership: { select: { id: true } },
  address: {
    select: {
      zipCode: true,
      state: true,
      city: true,
      street: true,
      number: true,
      complement: true,
    },
  },
} as const;

// Função para serializar o perfil do usuário, removendo a propriedade systemOwnership e adicionando isSystemOwner
const serializeSelfProfile = <T extends { systemOwnership: unknown }>(
  user: T
) => {
  const { systemOwnership, ...personalProfile } = user;

  return {
    ...personalProfile,
    isSystemOwner: Boolean(systemOwnership),
  };
};

export const getSelfProfile = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: selfProfileSelect,
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(serializeSelfProfile(user));
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateSelfProfile = async (
  req: Request,
  res: Response
): Promise<any> => {
  const userId = req.user!.userId;
  const {
    name,
    phoneNumber,
    birthDate,
    address,
    currentPassword,
    newPassword,
  } = req.body;

  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        password: true,
        address: { select: { id: true } },
      },
    });

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    let password: string | undefined;

    if (newPassword !== undefined) {
      if (
        !currentUser.password ||
        !(await bcrypt.compare(currentPassword, currentUser.password))
      ) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      if (await bcrypt.compare(newPassword, currentUser.password)) {
        return res.status(400).json({
          error: 'New password must be different from the current password',
        });
      }

      password = await hashPassword(newPassword);
    }

    const updatedUser = await prisma.$transaction(async (transaction) => {
      const data: Record<string, any> = {};

      if (name !== undefined) data.name = name;
      if (phoneNumber !== undefined) data.phoneNumber = phoneNumber;
      if (birthDate !== undefined) {
        data.birthDate = birthDate ? parseDateOnly(birthDate) : null;
      }
      if (password !== undefined) data.password = password;

      if (address === null) {
        if (currentUser.address) {
          data.address = { delete: true };
        }
      } else if (address !== undefined) {
        data.address = {
          upsert: {
            create: address,
            update: address,
          },
        };
      }

      if (Object.keys(data).length === 0) {
        const user = await transaction.user.findUniqueOrThrow({
          where: { id: userId },
          select: selfProfileSelect,
        });

        return serializeSelfProfile(user);
      }

      const user = await transaction.user.update({
        where: { id: userId },
        data,
        select: selfProfileSelect,
      });

      if (password !== undefined) {
        await transaction.passwordReset.updateMany({
          where: {
            userId,
            usedAt: null,
            invalidatedAt: null,
          },
          data: { invalidatedAt: new Date() },
        });
      }

      return serializeSelfProfile(user);
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating self profile', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

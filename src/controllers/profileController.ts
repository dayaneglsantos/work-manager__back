import { Request, Response } from 'express';
import prisma from '../services/prisma';

export const createProfile = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { name } = req.body;

  try {
    const existingProfile = await prisma.profile.findFirst({
      where: {
        name,
      },
    });

    if (existingProfile) {
      return res.status(400).json({
        error: 'There is already a registered profile with this name.',
      });
    }

    const newProfile = await prisma.$transaction(async (transaction) => {
      const profile = await transaction.profile.create({ data: { name } });
      const permissions = await transaction.permission.findMany({
        select: { id: true },
      });

      // Depois de criar o perfil, cria as associações com as permissões existentes com hasPermission definido como false por padrão
      if (permissions.length > 0) {
        await transaction.profilePermission.createMany({
          data: permissions.map((permission) => ({
            profileId: profile.id,
            permissionId: permission.id,
            hasPermission: false,
          })),
        });
      }

      return profile;
    });

    return res.status(201).json(newProfile);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ----------------------------------------------------------------

export const getProfileById = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;

  try {
    const profile = await prisma.profile.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!profile) {
      return res
        .status(404)
        .json({ error: 'There is no profile with this id' });
    }

    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ----------------------------------------------------------------

export const getAllProfiles = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const profiles = await prisma.profile.findMany();

    return res.status(200).json(profiles);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ----------------------------------------------------------------

export const updateProfile = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;
  const { name } = req.body;

  if (name) {
    try {
      const profile = await prisma.profile.findUnique({
        where: { id: Number(id) },
        select: { fullAccess: true },
      });

      if (!profile) {
        return res
          .status(404)
          .json({ error: 'There is no profile with this id' });
      }

      if (profile.fullAccess) {
        return res
          .status(409)
          .json({ error: 'The full-access profile cannot be changed' });
      }

      await prisma.profile.update({
        where: { id: Number(id) },
        data: { name: name },
      });

      return res.status(201).json({ message: 'Profile updated successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};

// ----------------------------------------------------------------

export const deleteProfile = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;

  try {
    const existingProfile = await prisma.profile.findUnique({
      where: { id: Number(id) },
      select: { fullAccess: true },
    });

    if (!existingProfile) {
      return res
        .status(404)
        .json({ error: 'There is no profile with this id' });
    }

    if (existingProfile.fullAccess) {
      return res
        .status(409)
        .json({ error: 'The full-access profile cannot be deleted' });
    }

    const profile = await prisma.profile.delete({
      where: { id: Number(id) },
    });

    return res.status(201).json({ message: 'Profile deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

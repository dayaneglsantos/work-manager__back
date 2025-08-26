import { Request, Response } from 'express';
import prisma from '../../services/prisma';

export const getAllProfilePermissions = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const permissions = await prisma.profilePermission.findMany();

    return res.status(200).json(permissions);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createProfilePermission = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { profileId, permissionId, hasPermission } = req.body;

  try {
    const newProfilePermission = await prisma.profilePermission.create({
      data: { profileId, permissionId, hasPermission },
    });

    return res.status(201).json(newProfilePermission);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateProfilePermission = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;
  const { profileId, permissionId, hasPermission } = req.body;

  try {
    const updatedProfilePermission = await prisma.profilePermission.update({
      where: { id: Number(id) },
      data: { profileId, permissionId, hasPermission },
    });

    return res.status(201).json(updatedProfilePermission);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteProfilePermission = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;

  try {
    const profilePermission = await prisma.profilePermission.delete({
      where: { id: Number(id) },
    });

    if (!profilePermission) {
      return res
        .status(404)
        .json({ error: 'There is no profile permission with this id' });
    }

    return res
      .status(201)
      .json({ message: 'Profile permission deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

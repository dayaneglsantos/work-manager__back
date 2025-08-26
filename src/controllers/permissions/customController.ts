import { Request, Response } from 'express';
import prisma from '../../services/prisma';

export const getAllCustomPermissions = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const customPermissions = await prisma.customPermission.findMany();

    return res.status(200).json(customPermissions);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createCustomPermission = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { userId, permissionId, hasPermission } = req.body;

  try {
    const newCustomPermission = await prisma.customPermission.create({
      data: { userId, permissionId, hasPermission },
    });

    return res.status(201).json(newCustomPermission);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateCustomPermission = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;
  const { userId, permissionId, hasPermission } = req.body;

  try {
    const updatedCustomPermission = await prisma.customPermission.update({
      where: { id: Number(id) },
      data: { userId, permissionId, hasPermission },
    });

    return res.status(201).json(updatedCustomPermission);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteCustomPermission = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;

  try {
    const customPermission = await prisma.customPermission.delete({
      where: { id: Number(id) },
    });

    if (!customPermission) {
      return res
        .status(404)
        .json({ error: 'There is no custom permission with this id' });
    }

    return res
      .status(201)
      .json({ message: 'Custom permission deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

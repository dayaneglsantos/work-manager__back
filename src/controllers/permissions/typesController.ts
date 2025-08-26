import { Request, Response } from 'express';
import prisma from '../../services/prisma';

export const getAllPermissionTypes = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const types = await prisma.permissionType.findMany();

    return res.status(200).json(types);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updatePermissionType = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;
  const { name } = req.body;

  if (name) {
    try {
      await prisma.permissionType.update({
        where: { id: Number(id) },
        data: { name },
      });

      return res
        .status(201)
        .json({ message: 'Permisiion type updated successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};

export const createPermissionType = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { name } = req.body;

  try {
    const existingType = await prisma.permissionType.findUnique({
      where: { name: name },
    });

    if (existingType) {
      return res.status(400).json({
        error: 'There is already a permission type with this name.',
      });
    }

    const newType = await prisma.permissionType.create({
      data: { name: name },
    });

    return res.status(201).json(newType);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deletePermissionType = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;

  try {
    const type = await prisma.permissionType.delete({
      where: { id: Number(id) },
    });

    if (!type) {
      return res.status(404).json({ error: 'There is no type with this id' });
    }

    return res
      .status(201)
      .json({ message: 'Permission type deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

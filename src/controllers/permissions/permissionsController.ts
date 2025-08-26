import { Request, Response } from 'express';
import prisma from '../../services/prisma';

export const getAllPermissions = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const permissions = await prisma.permission.findMany();

    return res.status(200).json(permissions);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createPermission = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { actionId, typeId } = req.body;

  const type = await prisma.permissionType.findUnique({
    where: { id: typeId },
  });
  const action = await prisma.permissionAction.findUnique({
    where: { id: actionId },
  });

  if (!type) {
    return res.status(400).json({ error: 'Invalid permission type ID' });
  }
  if (!action) {
    return res.status(400).json({ error: 'Invalid permission action ID' });
  }

  const name = `${action.name}-${type.name}`;

  try {
    const existingType = await prisma.permission.findUnique({
      where: { name },
    });

    if (existingType) {
      return res.status(400).json({
        error: 'There is already a permission with this name.',
      });
    }

    const newPermission = await prisma.permission.create({
      data: { name, actionId, typeId },
    });

    return res.status(201).json(newPermission);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const editPermission = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;
  const { name, actionId, typeId } = req.body;

  try {
    await prisma.permission.update({
      where: { id: Number(id) },
      data: { name, actionId, typeId },
    });

    return res.status(201).json({ message: 'Permission updated successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
export const deletePermission = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;

  try {
    const permission = await prisma.permission.delete({
      where: { id: Number(id) },
    });

    if (!permission) {
      return res
        .status(404)
        .json({ error: 'There is no permission with this id' });
    }

    return res.status(201).json({ message: 'Permission deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

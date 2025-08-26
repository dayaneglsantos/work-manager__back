import { Request, Response } from 'express';
import prisma from '../../services/prisma';

export const getAllPermissionActions = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const action = await prisma.permissionAction.findMany();

    return res.status(200).json(action);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updatePermissionAction = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;
  const { name } = req.body;

  if (name) {
    try {
      await prisma.permissionAction.update({
        where: { id: Number(id) },
        data: { name: name },
      });

      return res.status(201).json({ message: 'Action updated successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};

export const createPermissionAction = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { name } = req.body;

  try {
    const existingAction = await prisma.permissionAction.findUnique({
      where: { name: name },
    });

    if (existingAction) {
      return res.status(400).json({
        error: 'There is already a permission action with this name.',
      });
    }

    const newAction = await prisma.permissionAction.create({
      data: { name: name },
    });

    return res.status(201).json(newAction);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deletePermissionAction = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;

  try {
    const action = await prisma.permissionAction.delete({
      where: { id: Number(id) },
    });

    if (!action) {
      return res.status(404).json({ error: 'There is no action with this id' });
    }

    return res.status(201).json({ message: 'Action deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

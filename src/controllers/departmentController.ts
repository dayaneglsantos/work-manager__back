import { Request, Response } from 'express';
import prisma from '../services/prisma';

export const createDepartment = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { name, managerId } = req.body;

  try {
    const existingDepartment = await prisma.department.findUnique({
      where: {
        name,
      },
    });

    if (existingDepartment) {
      return res.status(400).json({
        error: 'There is already a registered department with this name.',
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: managerId },
    });
    if (!existingUser) {
      return res.status(400).json({
        error: 'There is no user with this id.',
      });
    }

    const newDepartment = await prisma.department.create({
      data: {
        name,
        manager: { connect: { id: managerId } },
      },
    });

    return res.status(201).json(newDepartment);
  } catch (err) {
    const error = err as Error;
    return res
      .status(500)
      .json({ error: 'Internal Server Error', message: error.message });
  }
};

export const getDepartment = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;
  const formatedId = parseInt(id, 10);

  try {
    const department = await prisma.department.findUnique({
      where: {
        id: formatedId,
      },
    });

    return res.status(200).json(department);
  } catch (err) {
    const error = err as Error;
    return res
      .status(500)
      .json({ error: 'Internal Server Error', message: error.message });
  }
};

export const getAllDepartments = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const departments = await prisma.department.findMany();

    return res.status(200).json(departments);
  } catch (err) {
    const error = err as Error;
    return res
      .status(500)
      .json({ error: 'Internal Server Error', message: error.message });
  }
};

export const updateDepartment = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;
  const { name, managerId } = req.body;
  const formatedId = parseInt(id, 10);

  try {
    const existingDepartment = await prisma.department.findUnique({
      where: {
        id: formatedId,
      },
    });

    if (!existingDepartment) {
      return res.status(400).json({
        error: 'There is no department with this id.',
      });
    }
    if (name) {
      await prisma.department.update({
        where: { id: formatedId },
        data: { name },
      });
    }
    if (managerId) {
      const existingUser = await prisma.user.findUnique({
        where: { id: managerId },
      });
      if (!existingUser) {
        return res.status(400).json({
          error: 'There is no user with this id.',
        });
      }
      await prisma.department.update({
        where: { id: formatedId },
        data: { managerId: managerId },
      });
    }

    return res.status(201).json({ message: 'Department updated successfully' });
  } catch (err) {
    const error = err as Error;
    return res
      .status(500)
      .json({ error: 'Internal Server Error', message: error.message });
  }
};

export const deleteDepartment = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;
  const formatedId = parseInt(id, 10);

  try {
    const existingDepartment = await prisma.department.findUnique({
      where: {
        id: formatedId,
      },
    });

    if (!existingDepartment) {
      return res.status(400).json({
        error: 'There is no department with this id.',
      });
    }

    await prisma.department.delete({
      where: {
        id: formatedId,
      },
    });

    return res.status(201).json({ message: 'Department deleted successfully' });
  } catch (err) {
    const error = err as Error;
    return res
      .status(500)
      .json({ error: 'Internal Server Error', message: error.message });
  }
};

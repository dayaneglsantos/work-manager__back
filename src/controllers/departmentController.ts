import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import prisma from '../services/prisma';

const departmentInclude = {
  manager: {
    select: {
      id: true,
      name: true,
      employmentStatus: true,
      profileImage: true,
    },
  },
  _count: { select: { users: true } },
};

const notFound = (res: Response) =>
  res.status(404).json({ error: 'There is no department with this id.' });

const departmentError = (res: Response, error: unknown) => {
  // Se o erro for do tipo PrismaClientKnownRequestError (reconhecido pelo prisma), podemos verificar o código do erro para fornecer respostas mais específicas.
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        error: 'There is already a registered department with this name.',
      });
    }

    if (error.code === 'P2025') return notFound(res);

    if (error.code === 'P2003') {
      return res
        .status(409)
        .json({ error: 'The operation conflicts with an associated user.' });
    }
  }
  return res.status(500).json({ error: 'Internal Server Error' });
};

export const createDepartment = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { name, managerId } = req.body;
  try {
    const manager = await prisma.user.findUnique({
      where: { id: managerId },
      select: { employmentStatus: true },
    });

    if (!manager)
      return res.status(400).json({ error: 'There is no user with this id.' });

    if (manager.employmentStatus !== 'active') {
      return res.status(400).json({
        error: 'Você não pode atribuir um gerente inativo a um departamento.',
      });
    }
    const department = await prisma.department.create({
      data: { name, managerId },
    });

    return res.status(201).json(department);
  } catch (error) {
    return departmentError(res, error);
  }
};

export const getDepartment = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const department = await prisma.department.findUnique({
      where: { id: Number(req.params.id) },
      include: departmentInclude,
    });
    if (!department) return notFound(res);
    return res.status(200).json(department);
  } catch (error) {
    console.log(error);
    return departmentError(res, error);
  }
};

export const getAllDepartments = async (
  _req: Request,
  res: Response
): Promise<any> => {
  try {
    const departments = await prisma.department.findMany({
      include: departmentInclude,
    });
    return res.status(200).json(departments);
  } catch (error) {
    return departmentError(res, error);
  }
};

export const partialUpdateDepartment = async (
  req: Request,
  res: Response
): Promise<any> => {
  const id = Number(req.params.id);
  const { name, managerId } = req.body;
  try {
    const department = await prisma.department.findUnique({ where: { id } });

    if (!department) return notFound(res);

    // Se o managerId for fornecido e for diferente do atual, verifique se o gerente existe e está ativo.
    if (managerId !== undefined && managerId !== department.managerId) {
      const manager = await prisma.user.findUnique({
        where: { id: managerId },
        select: { employmentStatus: true },
      });

      if (!manager)
        return res
          .status(400)
          .json({ error: 'There is no user with this id.' });

      if (manager.employmentStatus !== 'active') {
        return res.status(400).json({
          error: 'Você não pode atribuir um gerente inativo a um departamento.',
        });
      }
    }
    // O índice único protege nomes duplicados, inclusive sob concorrência.
    const updatedDepartment = await prisma.department.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }), // Atualiza o nome apenas se for fornecido
        ...(managerId !== undefined && { managerId }), // Atualiza o managerId apenas se for fornecido
      },
    });
    return res.status(200).json(updatedDepartment);
  } catch (error) {
    return departmentError(res, error);
  }
};

export const deleteDepartment = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    await prisma.department.delete({ where: { id: Number(req.params.id) } });
    return res.status(204).send();
  } catch (error) {
    return departmentError(res, error);
  }
};

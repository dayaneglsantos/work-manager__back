import { NextFunction, Request, Response } from 'express';
import hashPassword from '../services/hashService';
import prisma from '../services/prisma';
import { Prisma } from '@prisma/client';

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const {
    name,
    email,
    phoneNumber,
    address,
    birthDate,
    password,
    profileImage,
    profileId,
    supervisorId,
    departmentId,
    currentPosition,
    currentSalary,
    admissionDate,
    employmentStatus,
    notes,
  } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: 'There is already a registered user with this email.' });
    }

    const hashedPassword = await hashPassword(password);
    if (!hashedPassword) {
      throw new Error('Failed to hash the password');
    }

    const userData = {
      name,
      email,
      phoneNumber,
      birthDate,
      profileImage,
      employmentStatus,
      notes,
      currentPosition,
      currentSalary,
      admissionDate: new Date(admissionDate),
      profile: { connect: { id: profileId } },
      supervisor: supervisorId ? { connect: { id: supervisorId } } : undefined,
      address: {
        create: address,
      },
      password: hashedPassword,
      ...(departmentId && { department: { connect: { id: departmentId } } }),
    };

    const newUser = await prisma.user.create({
      data: userData,
    });

    return res.status(201).json(newUser);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
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
        supervisor: true,
        department: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'There is no user with this id' });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
export const getAllUses = async (req: Request, res: Response): Promise<any> => {
  try {
    const users = await prisma.user.findMany({
      include: {
        address: true,
        profile: true,
        supervisor: true,
        department: true,
      },
    });

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
export const updateUser = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const {
    name,
    email,
    phoneNumber,
    birthday,
    profileImage,
    password,
    profileId,
    supervisorId,
    departmentId,
    currentSalary,
    admissionDate,
    currentPosition,
    employmentStatus,
    notes,
    address,
  } = req.body;

  const fieldsToUpdate: Prisma.UserUpdateInput = {};

  if (name) fieldsToUpdate.name = name;
  if (email) fieldsToUpdate.email = email;
  if (phoneNumber) fieldsToUpdate.phoneNumber = phoneNumber;
  if (profileImage) fieldsToUpdate.profileImage = profileImage;
  if (employmentStatus) fieldsToUpdate.employmentStatus = employmentStatus;
  if (notes) fieldsToUpdate.notes = notes;

  if (birthday) fieldsToUpdate.birthDate = new Date(birthday);
  if (admissionDate) fieldsToUpdate.admissionDate = admissionDate;
  if (password) fieldsToUpdate.password = await hashPassword(password);

  if (profileId) fieldsToUpdate.profile = { connect: { id: profileId } };
  if (supervisorId)
    fieldsToUpdate.supervisor = { connect: { id: supervisorId } };
  if (departmentId)
    fieldsToUpdate.department = { connect: { id: departmentId } };
  if (currentSalary) fieldsToUpdate.currentSalary = currentSalary;
  if (currentPosition) fieldsToUpdate.currentPosition = currentPosition;

  // Upsert faz a atualização caso exista ou cria um novo registro se não existir
  if (address) {
    fieldsToUpdate.address = {
      update: address,
    };
  }

  if (Object.keys(fieldsToUpdate).length > 0) {
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

      return res.status(201).json({ message: 'User updated successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    return res.status(400).json({ error: 'No fields to update' });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;

  try {
    await prisma.address.delete({
      where: {
        userId: Number(id),
      },
    });
    const user = await prisma.user.delete({
      where: {
        id: Number(id),
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'There is no user with this id' });
    }

    return res.status(201).json({ message: 'User deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

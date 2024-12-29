import { Request, Response } from 'express';
import Department from '../models/departmentModel';
import User from '../models/userModel';

export const createDepartment = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { name, manager_id } = req.body;

  try {
    const existingDepartment = await Department.getByName(name);

    if (existingDepartment) {
      return res.status(400).json({
        error: 'There is already a registered department with this name.',
      });
    }

    const newDepartment = await Department.create({ name, manager_id });

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
    const department = await Department.getById(formatedId);

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
    const departments = await Department.getAll();

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
  const { name, manager_id } = req.body;
  const formatedId = parseInt(id, 10);

  try {
    const existingDepartment = await Department.getById(formatedId);

    if (!existingDepartment) {
      return res.status(400).json({
        error: 'There is no department with this id.',
      });
    }
    if (name) {
      await Department.updateName(formatedId, name);
    }
    if (manager_id) {
      const existingUser = await User.getById(manager_id);
      if (!existingUser) {
        return res.status(400).json({
          error: 'There is no user with this id.',
        });
      }
      await Department.updateManager(formatedId, manager_id);
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
    const existingDepartment = await Department.getById(formatedId);

    if (!existingDepartment) {
      return res.status(400).json({
        error: 'There is no department with this id.',
      });
    }

    await Department.delete(formatedId);

    return res.status(201).json({ message: 'Department deleted successfully' });
  } catch (err) {
    const error = err as Error;
    return res
      .status(500)
      .json({ error: 'Internal Server Error', message: error.message });
  }
};

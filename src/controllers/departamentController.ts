import { Request, Response } from 'express';
import Departament from '../models/departamentModel';
import User from '../models/userModel';

export const createDepartament = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { name, manager_id } = req.body;

  try {
    const existingDepartament = await Departament.getByName(name);

    if (existingDepartament) {
      return res.status(400).json({
        error: 'There is already a registered departament with this name.',
      });
    }

    const newDepartament = await Departament.create({ name, manager_id });

    return res.status(201).json(newDepartament);
  } catch (err) {
    const error = err as Error;
    return res
      .status(500)
      .json({ error: 'Internal Server Error', message: error.message });
  }
};

export const getDepartament = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;
  const formatedId = parseInt(id, 10);

  try {
    const departament = await Departament.getById(formatedId);

    return res.status(200).json(departament);
  } catch (err) {
    const error = err as Error;
    return res
      .status(500)
      .json({ error: 'Internal Server Error', message: error.message });
  }
};

export const getAllDepartaments = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const departaments = await Departament.getAll();

    return res.status(200).json(departaments);
  } catch (err) {
    const error = err as Error;
    return res
      .status(500)
      .json({ error: 'Internal Server Error', message: error.message });
  }
};

export const updateDepartament = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;
  const { name, manager_id } = req.body;
  const formatedId = parseInt(id, 10);

  try {
    const existingDepartament = await Departament.getById(formatedId);

    if (!existingDepartament) {
      return res.status(400).json({
        error: 'There is no departament with this id.',
      });
    }
    if (name) {
      await Departament.updateName(formatedId, name);
    }
    if (manager_id) {
      const existingUser = await User.getById(manager_id);
      if (!existingUser) {
        return res.status(400).json({
          error: 'There is no user with this id.',
        });
      }
      await Departament.updateManager(formatedId, manager_id);
    }

    return res.status(201).json({ message: 'Department updated successfully' });
  } catch (err) {
    const error = err as Error;
    return res
      .status(500)
      .json({ error: 'Internal Server Error', message: error.message });
  }
};

export const deleteDepartament = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;
  const formatedId = parseInt(id, 10);

  try {
    const existingDepartament = await Departament.getById(formatedId);

    if (!existingDepartament) {
      return res.status(400).json({
        error: 'There is no departament with this id.',
      });
    }

    await Departament.delete(formatedId);

    return res.status(201).json({ message: 'Department deleted successfully' });
  } catch (err) {
    const error = err as Error;
    return res
      .status(500)
      .json({ error: 'Internal Server Error', message: error.message });
  }
};

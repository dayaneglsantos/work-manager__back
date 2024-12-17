import { Request, Response } from 'express';
import Profile from '../models/profileModel';

export const createProfile = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { name } = req.body;

  try {
    const existingProfile = await Profile.getByName(name);

    if (existingProfile) {
      return res.status(400).json({
        error: 'There is already a registered profile with this name.',
      });
    }

    const newProfile = await Profile.create({ name: name });

    return res.status(201).json(newProfile);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
export const getProfileById = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;

  try {
    const profile = await Profile.getById(id);

    if (!profile) {
      return res
        .status(404)
        .json({ error: 'There is no profile with this id' });
    }

    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
export const getAllProfiles = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const profiles = await Profile.getAll();

    return res.status(200).json(profiles);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
export const updateProfile = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;
  const { name } = req.body;

  if (name) {
    try {
      await Profile.update(id, name);

      return res.status(201).json({ message: 'Profile updated successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};

export const deleteProfile = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;

  try {
    const profile = await Profile.delete(id);

    if (!profile) {
      return res
        .status(404)
        .json({ error: 'There is no profile with this id' });
    }

    return res.status(201).json({ message: 'Profile deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

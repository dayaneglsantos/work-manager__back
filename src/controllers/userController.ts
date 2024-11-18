import { Request, Response } from 'express';
import User from '../models/userModel';
import Address from '../models/addressModel';
import hashPassword from '../services/hashService';

export const createUser = async (req: Request, res: Response): Promise<any> => {
  const {
    name,
    email,
    phone_number,
    emergency_contact,
    address,
    birthday,
    password,
    profile_img,
    profile_id,
    supervisor_id,
    departament_id,
    current_position,
    current_salary,
    admission_date,
    employment_status,
    notes,
  } = req.body;

  try {
    const existingUser = await User.getByEmail(email);

    if (existingUser) {
      return res
        .status(400)
        .json({ error: 'There is already a registered user with this email.' });
    }

    const hashedPassword = await hashPassword(password);
    if (!hashedPassword) {
      throw new Error('Failed to hash the password');
    }

    const addressId = await Address.create(address);
    if (!addressId) {
      return res.status(400).json({ error: 'Failed to create address' });
    }

    const newUser = await User.create({
      name,
      email,
      phone_number,
      address_id: addressId,
      emergency_contact,
      birthday,
      profile_img,
      password: hashedPassword,
      profile_id,
      supervisor_id,
      departament_id,
      current_salary,
      admission_date,
      current_position,
      employment_status,
      notes,
    });

    return res.status(201).json(newUser);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

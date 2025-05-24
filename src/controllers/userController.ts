import { NextFunction, Request, Response } from 'express';
import User, { UserType } from '../models/userModel';
import Address from '../models/addressModel';
import hashPassword from '../services/hashService';
import { updateAddress } from './addressController';

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
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
    department_id,
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
      department_id,
      current_salary,
      admission_date,
      current_position,
      employment_status,
      notes,
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
    const user = await User.getById(id);

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
    const users = await User.getAll();

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
    phone_number,
    emergency_contact,
    birthday,
    profile_img,
    password,
    profile_id,
    supervisor_id,
    department_id,
    current_salary,
    admission_date,
    current_position,
    employment_status,
    notes,
    address,
  } = req.body;

  interface FieldsToUpdate extends Partial<UserType> {}

  const fieldsToUpdate: FieldsToUpdate = {};

  if (name) fieldsToUpdate.name = name;
  if (email) fieldsToUpdate.email = email;
  if (phone_number) fieldsToUpdate.phone_number = phone_number;
  if (emergency_contact) fieldsToUpdate.emergency_contact = emergency_contact;
  if (birthday) fieldsToUpdate.birthday = birthday;
  if (profile_img) fieldsToUpdate.profile_img = profile_img;
  if (password) fieldsToUpdate.password = await hashPassword(password);
  if (profile_id) fieldsToUpdate.profile_id = profile_id;
  if (supervisor_id) fieldsToUpdate.supervisor_id = supervisor_id;
  if (department_id) fieldsToUpdate.department_id = department_id;
  if (current_salary) fieldsToUpdate.current_salary = current_salary;
  if (admission_date) fieldsToUpdate.admission_date = admission_date;
  if (current_position) fieldsToUpdate.current_position = current_position;
  if (employment_status) fieldsToUpdate.employment_status = employment_status;
  if (notes) fieldsToUpdate.notes = notes;

  if (address) {
    const { address_id } = await User.getById(id);
    const updatedAddress = await Address.update(address_id, address);
    if (!updatedAddress) {
      return res.status(400).json({ error: 'Failed to update address' });
    }
    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(201).json({ message: 'User updated successfully' });
    }
  }

  if (Object.keys(fieldsToUpdate).length > 0) {
    try {
      const user = await User.update(id, fieldsToUpdate);

      if (!user) {
        return res.status(404).json({ error: 'There is no user with this id' });
      }

      return res.status(201).json({ message: 'User updated successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;

  try {
    const user = await User.delete(id);

    if (!user) {
      return res.status(404).json({ error: 'There is no user with this id' });
    }

    return res.status(201).json({ message: 'User deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

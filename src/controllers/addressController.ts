import { Request, Response } from 'express';
import Profile from '../models/profileModel';
import Address from '../models/addressModel';

interface AddressType {
  zip_code?: string;
  state?: string;
  city?: string;
  street?: string;
  number?: number;
  complement?: string;
}

export const getAddressById = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;

  try {
    const address = await Address.getAddressById(Number(id));

    if (!address) {
      return res
        .status(404)
        .json({ error: 'There is no address with this id' });
    }

    return res.status(200).json(address);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
export const getAllAddresses = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const Addresses = await Address.getAll();

    return res.status(200).json(Addresses);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
export const updateAddress = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;
  const { zip_code, state, city, street, number, complement } = req.body;

  const fieldsToUpdate: AddressType = {};

  if (zip_code) fieldsToUpdate.zip_code = zip_code;
  if (state) fieldsToUpdate.state = state;
  if (city) fieldsToUpdate.city = city;
  if (street) fieldsToUpdate.street = street;
  if (number) fieldsToUpdate.number = number;
  if (complement) fieldsToUpdate.complement = complement;

  if (Object.keys(fieldsToUpdate).length > 0) {
    try {
      const address = await Address.update(id, fieldsToUpdate);

      if (!address) {
        return res
          .status(404)
          .json({ error: 'There is no address with this id' });
      }

      return res.status(201).json({ message: 'Address updated successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};

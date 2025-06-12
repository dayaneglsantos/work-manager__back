import { Request, Response } from 'express';
import prisma from '../services/prisma';

export const getAddressById = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { id } = req.params;

  try {
    const address = await prisma.address.findUnique({
      where: {
        id: Number(id),
      },
    });

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
    const Addresses = await prisma.address.findMany();

    return res.status(200).json(Addresses);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

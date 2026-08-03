import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import prisma from './prisma';
import { canAccessSystem } from './employmentStatusService';
dotenv.config();

const authenticateUser = async (
  email: string,
  password: string
): Promise<string | null> => {
  const secretKey = process.env.JWT_SECRET;
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (typeof secretKey !== 'string') {
    throw new Error(
      'JWT secret key is not defined or is not a string in environment variables'
    );
  }

  if (!user) {
    return null;
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    return null;
  }

  if (!canAccessSystem(user.employmentStatus)) {
    return null;
  }

  const token = jwt.sign({ userId: user.id }, secretKey, {
    expiresIn: '7d', // token expira em 7 dias
  });

  return token;
};

export default authenticateUser;

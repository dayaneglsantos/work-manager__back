import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from './prisma';
import { canAccessSystem } from './employmentStatusService';
import { env } from '../config/env';

const authenticateUser = async (
  email: string,
  password: string
): Promise<string | null> => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

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

  const token = jwt.sign({ userId: user.id }, env.jwtSecret, {
    expiresIn: '7d', // token expira em 7 dias
  });

  return token;
};

export default authenticateUser;

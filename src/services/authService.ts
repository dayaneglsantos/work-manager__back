import User from '../models/userModel';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const authenticateUser = async (
  email: string,
  password: string
): Promise<string | null> => {
  const secretKey = process.env.jwt_secret;
  const user = await User.getByEmail(email);

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

  const token = jwt.sign({ userId: user.id }, secretKey);

  return token;
};

export default authenticateUser;

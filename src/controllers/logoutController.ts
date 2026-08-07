import { Response, Request } from 'express';
import { authCookieName, authCookieOptions } from '../config/authCookie';

export const logout = async (req: Request, res: Response): Promise<any> => {
  res.clearCookie(authCookieName, authCookieOptions);
  return res.status(200).json({ message: 'Logout realizado com sucesso.' });
};

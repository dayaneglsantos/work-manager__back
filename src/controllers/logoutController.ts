import { Response, Request } from 'express';

export const logout = async (req: Request, res: Response): Promise<any> => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    // sameSite: 'strict',
    maxAge: 0, // Expira imediatamente
  };

  res.clearCookie('token', cookieOptions);
  return res.status(200).json({ message: 'Logout successful' });
};

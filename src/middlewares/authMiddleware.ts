import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'seu-segredo-aqui';

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    (req as any).user = decoded; // Adiciona o user sem erro de tipagem
    next();
  } catch (err) {
    return res
      .status(403)
      .json({ error: 'Forbidden: Invalid or expired token' });
  }
};

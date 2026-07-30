import { NextFunction, Request, Response } from 'express';

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (res.headersSent) {
    next(err);
    return;
  }

  console.error(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ->`,
    err
  );

  res.status(500).json({ error: 'Internal Server Error' });
};

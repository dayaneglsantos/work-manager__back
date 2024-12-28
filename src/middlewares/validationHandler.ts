import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validationHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req).formatWith(({ msg }) => ({
    error_message: msg,
  }));
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
  } else {
    next();
  }
};

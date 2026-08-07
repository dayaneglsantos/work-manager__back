import type { CookieOptions } from 'express';
import { env } from './env';

export const authCookieName = 'token';

export const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: 'strict',
  path: '/',
};

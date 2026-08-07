import dotenv from 'dotenv';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error('JWT_SECRET is required');
}

export const env = {
  jwtSecret,
  nodeEnv: process.env.NODE_ENV ?? 'development',
  appPort: Number(process.env.APP_PORT ?? 3000),
  frontendDevUrl: process.env.FRONTEND_DEV_URL,
  frontendProdUrl: process.env.FRONTEND_PROD_URL,
};

import dotenv from 'dotenv';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
const passwordResetSecret = process.env.PASSWORD_RESET_SECRET;
const smtpHost = process.env.SMTP_HOST;
const emailFrom = process.env.EMAIL_FROM;

if (!jwtSecret) {
  throw new Error('JWT_SECRET is required');
}

if (!passwordResetSecret) {
  throw new Error('PASSWORD_RESET_SECRET is required');
}

if (!smtpHost) {
  throw new Error('SMTP_HOST is required');
}

if (!emailFrom) {
  throw new Error('EMAIL_FROM is required');
}

export const env = {
  jwtSecret,
  passwordResetSecret,
  nodeEnv: process.env.NODE_ENV ?? 'development',
  appPort: Number(process.env.APP_PORT ?? 3000),
  frontendDevUrl: process.env.FRONTEND_DEV_URL,
  frontendProdUrl: process.env.FRONTEND_PROD_URL,
  smtpHost,
  smtpPort: Number(process.env.SMTP_PORT ?? 1025),
  smtpSecure: process.env.SMTP_SECURE === 'true',
  smtpUser: process.env.SMTP_USER,
  smtpPassword: process.env.SMTP_PASSWORD,
  emailFrom,
};

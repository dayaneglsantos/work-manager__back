import nodemailer from 'nodemailer';
import { env } from '../config/env';

type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

// O transporter representa a conexão SMTP. Em desenvolvimento ele aponta
// para o Mailpit; futuramente as variáveis podem apontar para outro provedor.
const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: env.smtpSecure,
  // O Mailpit não usa credenciais, então só adicionamos auth quando configurado.
  ...(env.smtpUser && env.smtpPassword
    ? {
        auth: {
          user: env.smtpUser,
          pass: env.smtpPassword,
        },
      }
    : {}),
});

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
}: SendEmailInput): Promise<void> => {
  await transporter.sendMail({
    from: env.emailFrom,
    to,
    subject,
    // Enviamos texto e HTML para atender clientes de e-mail diferentes.
    text,
    html,
  });
};

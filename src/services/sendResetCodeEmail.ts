import { sendEmail } from './emailService';

export const sendResetCodeEmail = async (
  email: string,
  code: string
): Promise<void> => {
  // Este serviço conhece o conteúdo da recuperação; a conexão SMTP fica isolada
  // no emailService para poder ser reutilizada por outros tipos de mensagem.
  await sendEmail({
    to: email,
    subject: 'Código para redefinição de senha',
    text: `Seu código de recuperação é ${code}. Ele expira em 15 minutos.`,
    html: `
      <h1>Redefinição de senha</h1>
      <p>Use o código abaixo para continuar:</p>
      <p><strong>${code}</strong></p>
      <p>Este código expira em 15 minutos.</p>
      <p>Se você não solicitou a redefinição, ignore esta mensagem.</p>
    `,
  });
};

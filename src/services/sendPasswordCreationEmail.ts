import { sendEmail } from './emailService';

type SendPasswordCreationEmailInput = {
  email: string;
  name: string;
  code: string;
  passwordCreationUrl: string;
};

const escapeHtml = (value: string): string =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
      })[character] ?? character
  );

const buildPasswordCreationEmail = ({
  name,
  code,
  passwordCreationUrl,
}: Omit<SendPasswordCreationEmailInput, 'email'>): string => {
  const safeName = escapeHtml(name);
  const safePasswordCreationUrl = escapeHtml(passwordCreationUrl);

  return `
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <title>Boas-vindas ao Work Manager</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f3f0f7; color: #2f2935; font-family: Arial, Helvetica, sans-serif;">
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">
      Use o código ${code} para criar sua senha no Work Manager.
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f0f7;">
      <tr>
        <td align="center" style="padding: 40px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(59, 30, 84, 0.12);">
            <tr>
              <td align="center" style="background-color: #3b1e54; padding: 28px 32px;">
                <p style="margin: 0; color: #cdb9e5; font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">Work Manager</p>
                <h1 style="margin: 10px 0 0; color: #ffffff; font-size: 26px; line-height: 1.25;">Boas-vindas!</h1>
              </td>
            </tr>

            <tr>
              <td style="padding: 36px 40px 16px;">
                <p style="margin: 0 0 16px; color: #2f2935; font-size: 16px; line-height: 1.6;">Olá, ${safeName}!</p>
                <p style="margin: 0; color: #62596a; font-size: 15px; line-height: 1.6;">Sua conta foi criada. Acesse a página abaixo e informe este código para criar sua senha:</p>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding: 16px 40px 24px;">
                <div style="display: inline-block; min-width: 250px; box-sizing: border-box; padding: 18px 28px; border: 1px solid #d8c9e8; border-radius: 12px; background-color: #f7f4fa; color: #3b1e54; font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 700; letter-spacing: 10px; line-height: 1; text-align: center;">${code}</div>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding: 0 40px 24px;">
                <a href="${safePasswordCreationUrl}" style="display: inline-block; padding: 14px 24px; border-radius: 10px; background-color: #3b1e54; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none;">Criar minha senha</a>
              </td>
            </tr>

            <tr>
              <td style="padding: 0 40px 36px;">
                <div style="padding: 14px 16px; border-radius: 10px; background-color: #fff8e8; color: #6f5414; font-size: 14px; line-height: 1.5;"><strong>Este código expira em 48 horas</strong> e pode ser utilizado apenas uma vez.</div>
                <p style="margin: 24px 0 0; color: #62596a; font-size: 14px; line-height: 1.6;">Se você não reconhece este cadastro, ignore a mensagem e entre em contato com o responsável pelo sistema.</p>
              </td>
            </tr>

            <tr>
              <td align="center" style="border-top: 1px solid #eee8f3; padding: 22px 32px; color: #8a818f; font-size: 12px; line-height: 1.5;">Mensagem automática do Work Manager. Não responda a este e-mail.</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
};

export const sendPasswordCreationEmail = async (
  input: SendPasswordCreationEmailInput
): Promise<void> => {
  await sendEmail({
    to: input.email,
    subject: 'Boas-vindas ao Work Manager — crie sua senha',
    text: [
      `Olá, ${input.name}!`,
      '',
      'Sua conta no Work Manager foi criada.',
      `Acesse ${input.passwordCreationUrl}`,
      `e informe o código: ${input.code}`,
      '',
      'O código expira em 48 horas e pode ser utilizado apenas uma vez.',
    ].join('\n'),
    html: buildPasswordCreationEmail(input),
  });
};

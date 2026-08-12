import { sendEmail } from './emailService';

const buildResetCodeEmail = (code: string): string => `
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <title>Redefinição de senha</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f3f0f7; color: #2f2935; font-family: Arial, Helvetica, sans-serif;">
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">
      Use o código ${code} para redefinir sua senha no Work Manager.
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f0f7;">
      <tr>
        <td align="center" style="padding: 40px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(59, 30, 84, 0.12);">
            <tr>
              <td align="center" style="background-color: #3b1e54; padding: 28px 32px;">
                <p style="margin: 0; color: #cdb9e5; font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">
                  Work Manager
                </p>
                <h1 style="margin: 10px 0 0; color: #ffffff; font-size: 26px; line-height: 1.25;">
                  Redefinição de senha
                </h1>
              </td>
            </tr>

            <tr>
              <td style="padding: 36px 40px 16px;">
                <p style="margin: 0 0 16px; color: #2f2935; font-size: 16px; line-height: 1.6;">
                  Recebemos uma solicitação para redefinir a senha da sua conta.
                </p>
                <p style="margin: 0; color: #62596a; font-size: 15px; line-height: 1.6;">
                  Digite o código abaixo na página de recuperação:
                </p>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding: 16px 40px 24px;">
                <div style="display: inline-block; min-width: 250px; box-sizing: border-box; padding: 18px 28px; border: 1px solid #d8c9e8; border-radius: 12px; background-color: #f7f4fa; color: #3b1e54; font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 700; letter-spacing: 10px; line-height: 1; text-align: center;">
                  ${code}
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding: 0 40px 36px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fff8e8; border-radius: 10px;">
                  <tr>
                    <td style="padding: 14px 16px; color: #6f5414; font-size: 14px; line-height: 1.5;">
                      <strong>Este código expira em 15 minutos</strong> e pode ser utilizado apenas uma vez.
                    </td>
                  </tr>
                </table>

                <p style="margin: 24px 0 0; color: #62596a; font-size: 14px; line-height: 1.6;">
                  Se você não solicitou a redefinição, ignore este e-mail. Sua senha continuará a mesma.
                </p>
              </td>
            </tr>

            <tr>
              <td align="center" style="border-top: 1px solid #eee8f3; padding: 22px 32px; color: #8a818f; font-size: 12px; line-height: 1.5;">
                Mensagem automática do Work Manager. Não responda a este e-mail.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

export const sendResetCodeEmail = async (
  email: string,
  code: string
): Promise<void> => {
  await sendEmail({
    to: email,
    subject: 'Seu código para redefinir a senha',
    text: [
      'Redefinição de senha — Work Manager',
      '',
      'Recebemos uma solicitação para redefinir a senha da sua conta.',
      `Seu código é: ${code}`,
      '',
      'O código expira em 15 minutos e pode ser utilizado apenas uma vez.',
      'Se você não fez esta solicitação, ignore este e-mail.',
    ].join('\n'),
    html: buildResetCodeEmail(code),
  });
};

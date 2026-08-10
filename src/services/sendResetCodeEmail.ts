export const sendResetCodeEmail = async (
  email: string,
  code: string
): Promise<void> => {
  // Aqui você pode implementar a lógica para enviar o código de redefinição de senha por email.
  // Por exemplo, você pode usar um serviço de email como SendGrid, Nodemailer, etc.
  console.log(`Enviando código de redefinição de senha para ${email}: ${code}`);
};

// O Vitest executa este arquivo antes de importar a aplicação. Assim, módulos
// que validam variáveis obrigatórias recebem valores exclusivos de teste.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-with-sufficient-length';
process.env.PASSWORD_RESET_SECRET = 'test-password-reset-secret';
process.env.SMTP_HOST = 'mail.invalid';
process.env.SMTP_PORT = '1025';
process.env.SMTP_SECURE = 'false';
process.env.EMAIL_FROM = 'Work Manager Test <test@work-manager.local>';
process.env.FRONTEND_DEV_URL = 'http://localhost:2400';

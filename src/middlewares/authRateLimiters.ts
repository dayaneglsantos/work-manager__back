import { Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';

const FIFTEEN_MINUTES_IN_MS = 15 * 60 * 1000;
const ONE_HOUR_IN_MS = 60 * 60 * 1000;

// Sem um store configurado, os contadores ficam na memória desta instância.
// Antes de executar vários backends, devemos usar um store compartilhado (Redis),
// evitando que cada instância mantenha uma contagem diferente.

const normalizedEmailKey = (req: Request): string => {
  // A mesma conta deve usar a mesma chave mesmo com espaços ou letras maiúsculas.
  const email = typeof req.body?.email === 'string' ? req.body.email : '';
  return email.trim().toLowerCase();
};

const hasValidEmail = (req: Request): boolean => {
  // Entradas sem um e-mail válido ficam sob o limite por IP, mas não compartilham
  // uma chave de conta artificial como "e-mail ausente".
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmailKey(req));
};

// ########################## Login ##########################

const loginRateLimitResponse = (_req: Request, res: Response): void => {
  res.status(429).json({
    error: 'Muitas tentativas de login. Tente novamente mais tarde.',
  });
};

// Protege o endpoint contra uma única origem tentando várias contas.
export const loginIpRateLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES_IN_MS, // Tempo de bloqueio de 15 minutos
  limit: 10, // Limite de 10 tentativas por IP
  standardHeaders: 'draft-8', // Retorna os cabeçalhos de limite de taxa padrão
  legacyHeaders: false, // Desativa os cabeçalhos de limite de taxa legados
  skipSuccessfulRequests: true, // Ignora solicitações bem-sucedidas para não contar contra o limite
  handler: loginRateLimitResponse, // Resposta personalizada para quando o limite é atingido
});

// Protege uma conta mesmo quando as tentativas vêm de IPs diferentes.
export const loginAccountRateLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES_IN_MS,
  limit: 5,
  keyGenerator: normalizedEmailKey, // Usa o e-mail normalizado como chave para limitar tentativas por conta
  skip: (req) => !hasValidEmail(req),
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: loginRateLimitResponse,
});

// ########################## Redefinição de senha ##########################

const passwordResetRateLimitResponse = (_req: Request, res: Response): void => {
  // A resposta permanece genérica para não confirmar se o e-mail está cadastrado.
  res.status(200).json({
    message:
      'Se o e-mail estiver associado a uma conta ativa, enviaremos um código de recuperação.',
  });
};

// Evita que uma única origem dispare solicitações para muitos e-mails.
export const passwordResetIpRateLimiter = rateLimit({
  windowMs: ONE_HOUR_IN_MS,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: passwordResetRateLimitResponse,
});

// Limita reenvios direcionados à mesma conta, independentemente do IP de origem.
export const passwordResetAccountRateLimiter = rateLimit({
  windowMs: ONE_HOUR_IN_MS,
  limit: 3,
  keyGenerator: normalizedEmailKey,
  skip: (req) => !hasValidEmail(req),
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: passwordResetRateLimitResponse,
});

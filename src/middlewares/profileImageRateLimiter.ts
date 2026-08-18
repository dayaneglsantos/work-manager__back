import { Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';

const FIFTEEN_MINUTES_IN_MS = 15 * 60 * 1000;

// Limita o número de solicitações de assinatura de upload de imagem de perfil por usuário autenticado
// Permite no máximo 10 solicitações a cada 15 minutos
export const profileImageSignatureRateLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES_IN_MS,
  limit: 10,
  keyGenerator: (req: Request) => String(req.user?.userId),
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      error: 'Muitas solicitações de upload. Tente novamente mais tarde.',
    });
  },
});

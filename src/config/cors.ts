// src/config/corsOptions.ts
import { CorsOptions } from 'cors'; // Importe o tipo se estiver usando TypeScript
import { env } from './env';

// SUBSTITUA PELAS URLs REAIS DO SEU FRONTEND (PRODUÇÃO E DESENVOLVIMENTO LOCAL)
const allowedOrigins = [env.frontendProdUrl, env.frontendDevUrl].filter(
  (origin): origin is string => Boolean(origin)
);

export const corsConfiguration: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS: Bloqueada origem não permitida: ${origin}`);
      callback(new Error('A origem não está autorizada pela política CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204,
};

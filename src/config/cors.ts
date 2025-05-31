// src/config/corsOptions.ts
import { CorsOptions } from 'cors'; // Importe o tipo se estiver usando TypeScript

// SUBSTITUA PELAS URLs REAIS DO SEU FRONTEND (PRODUÇÃO E DESENVOLVIMENTO LOCAL)
const allowedOrigins = [
  process.env.FRONTEND_PROD_URL,
  process.env.FRONTEND_DEV_URL,
];

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

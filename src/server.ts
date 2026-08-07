import express from 'express';
import routes from './routes/index';
import cors from 'cors';
import { corsConfiguration } from './config/cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/errorHandler';
import { env } from './config/env';

export const app = express();

app.use(cors(corsConfiguration));

app.use(cookieParser());

app.use(express.json());

app.use(routes);

app.use(errorHandler);

// Captura Promises rejeitadas sem tratamento
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

// Captura exceções síncronas não tratadas
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

app.listen(env.appPort, () => {
  console.log(`Server is running on port ${env.appPort}`);
});

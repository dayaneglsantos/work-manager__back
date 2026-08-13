import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { corsConfiguration } from './config/cors';
import { errorHandler } from './middlewares/errorHandler';
import routes from './routes/index';

export const app = express();

app.use(cors(corsConfiguration));
app.use(cookieParser());
app.use(express.json());
app.use(routes);
app.use(errorHandler);

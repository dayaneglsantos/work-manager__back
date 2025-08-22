import express from 'express';
import routes from './routes/index';
import cors from 'cors';
import { corsConfiguration } from './config/cors';
import cookieParser from 'cookie-parser';

export const app = express();

app.use(cors(corsConfiguration));

app.use(cookieParser());

app.use(express.json());

app.use(routes);

const PORT = process.env.APP_PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

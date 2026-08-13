import { app } from './app';
import { env } from './config/env';

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

app.listen(env.appPort, () => {
  console.log(`Server is running on port ${env.appPort}`);
});

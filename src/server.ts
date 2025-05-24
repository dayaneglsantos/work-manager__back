import express from 'express';
import routes from './routes/index';
export const app = express();

app.use((req, res, next) => {
  if (
    req.method === 'GET' ||
    req.method === 'DELETE' ||
    !req.headers['content-type']
  ) {
    return next();
  }
  express.json()(req, res, next);
});

app.use(routes);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log('Server is running on port 4000');
});

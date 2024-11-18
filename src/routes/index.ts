import { Router } from 'express';
import loginRoutes from './login';
import userRoutes from './users';
import departamentRoutes from './departaments';

const router = Router();

router.use(userRoutes);
router.use(loginRoutes);
router.use(departamentRoutes);

export default router;

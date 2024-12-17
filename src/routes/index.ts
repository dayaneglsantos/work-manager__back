import { Router } from 'express';
import loginRoutes from './login';
import userRoutes from './users';
import departamentRoutes from './departaments';
import profileRoutes from './profiles';

const router = Router();

router.use(userRoutes);
router.use(loginRoutes);
router.use(departamentRoutes);
router.use(profileRoutes);

export default router;

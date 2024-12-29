import { Router } from 'express';
import loginRoutes from './login';
import userRoutes from './users';
import departmentRoutes from './departments';
import profileRoutes from './profiles';

const router = Router();

router.use(userRoutes);
router.use(loginRoutes);
router.use(departmentRoutes);
router.use(profileRoutes);

export default router;

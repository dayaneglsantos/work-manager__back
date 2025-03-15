import { Router } from 'express';
import loginRoutes from './login';
import userRoutes from './users';
import departmentRoutes from './departments';
import profileRoutes from './profiles';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(loginRoutes);
router.use(authenticateToken);
router.use(userRoutes);
router.use(departmentRoutes);
router.use(profileRoutes);

export default router;

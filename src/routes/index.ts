import { Router } from 'express';
import loginRoutes from './login';
import userRoutes from './users';
import departmentRoutes from './departments';
import profileRoutes from './profiles';
import addressRoutes from './addresses';
import permissionRoutes from './permissions';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(loginRoutes);
router.use(authenticateToken);
router.use(userRoutes);
router.use(departmentRoutes);
router.use(profileRoutes);
router.use(addressRoutes);
router.use(permissionRoutes);

export default router;

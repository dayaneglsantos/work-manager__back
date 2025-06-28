import { Router } from 'express';
import loginRoutes from './login';
import userRoutes from './users';
import departmentRoutes from './departments';
import profileRoutes from './profiles';
import addressRoutes from './addresses';
import permissionRoutes from './permissions';
import tagsRoutes from './tags';
import tasksRoutes from './tasks';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(loginRoutes);
router.use(authenticateToken);
router.use(userRoutes);
router.use(departmentRoutes);
router.use(profileRoutes);
router.use(addressRoutes);
router.use(permissionRoutes);
router.use(tagsRoutes);
router.use(tasksRoutes);

export default router;

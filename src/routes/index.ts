import { Router } from 'express';
import loginRoutes from './login';
import logoutRoutes from './logout';
import userRoutes from './users';
import departmentRoutes from './departments';
import profileRoutes from './profiles';
import addressRoutes from './addresses';
import permissionRoutes from './permissions';
import tagsRoutes from './tags';
import tasksRoutes from './tasks';
import tasksTagsRoutes from './tasksTags';
import commentsRoutes from './comments';
import taskHistories from './taskHistories';
import passwordResetRoutes from './passwordReset';
import passwordCreationRoutes from './passwordCreation';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(loginRoutes);
router.use(logoutRoutes);
router.use(passwordResetRoutes);
router.use(passwordCreationRoutes);

// Aplica o middleware de autenticação para todas as rotas abaixo
router.use(authenticateToken);

// Rotas protegidas que requerem autenticação
router.use(userRoutes);
router.use(departmentRoutes);
router.use(profileRoutes);
router.use(addressRoutes);
router.use(permissionRoutes);
router.use(tagsRoutes);
router.use(tasksRoutes);
router.use(tasksTagsRoutes);
router.use(commentsRoutes);
router.use(taskHistories);

export default router;

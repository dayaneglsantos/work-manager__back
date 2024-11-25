import express from 'express';
import { createUser } from '../controllers/userController';

const router = express.Router();

router.post('/users', createUser); // Criar usuário
// router.get("/users", getUserById);
// router.get("/users/:id", getUserById); // Obter usuário por ID
// router.put("/users/:id", updateUser); // Atualizar usuário
// router.delete("/users/:id", deleteUser); // Excluir usuário

export default router;

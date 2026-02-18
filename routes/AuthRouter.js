import { Router } from 'express';
import AuthController from '../controller/authController.js';

export const authRouter = Router();

// Endpoint para registrar un nuevo usuario
authRouter.post('/register', AuthController.register);

// Endpoint para iniciar sesión
authRouter.post('/login', AuthController.login);

// Endpoint para cerrar sesión
authRouter.post('/logout', AuthController.logout);

export default authRouter;
import { Router } from 'express';
import AuthController from '../controller/authController.js';

export const authRouter = Router();

authRouter.post('/register', AuthController.register);
authRouter.post('/login', AuthController.login);
authRouter.post('/logout', AuthController.logout);
authRouter.post('/refresh', AuthController.refresh); // 🚩 Añadido

export default authRouter;
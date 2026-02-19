import { Router } from 'express';
import userController from "../controller/userController.js";

export const usersRouter = Router();

// Endpoint para obtener todos los usuarios
usersRouter.get('/', userController.getAll);

// Endpoint para obtener un usuario por email
usersRouter.get('/email/:email', userController.getByEmail);

// Endpoint para obtener un usuario por nickname
usersRouter.get('/nickname/:nickname', userController.getByNickname);

// Endpoint para obtener un usuario por ID
usersRouter.get('/:id', userController.getById);

// Endpoint para crear un nuevo usuario
usersRouter.post('/', userController.create);

// Endpoint para actualizar un usuario existente
usersRouter.put('/:id', userController.update);

// Endpoint para eliminar un usuario
usersRouter.delete('/:id', userController.delete);

export default usersRouter;
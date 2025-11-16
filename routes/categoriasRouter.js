import { Router } from "express";
import categoriasController from "../controller/categoriasController.js";

export const categoriasRouter = Router();

// Endpoint para obtener todas las categorías por tipo
categoriasRouter.get('/:tipo', categoriasController.getAll);

export default categoriasRouter;
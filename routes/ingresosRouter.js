import { Router } from "express";
import ingresosController from '../controllers/ingresosController.js';

export const ingresoRouter = Router();

// Endpoint para obtener todos los ingresos
ingresoRouter.get('/', ingresosController.getAllIngresos);

// Endpoint para obtener ingresos filtrados por mes y año
ingresoRouter.get('/:anyo/:mes', ingresosController.getIngresosByMonthYear);

// Endpoint para agregar un nuevo ingreso
ingresoRouter.post('/', ingresosController.createIngreso);

// Endpoint para actualizar un ingreso existente
ingresoRouter.put('/:id', ingresosController.updateIngreso);

// Endpoint para eliminar un ingreso
ingresoRouter.delete('/:id', ingresosController.deleteIngreso);

export default ingresoRouter;






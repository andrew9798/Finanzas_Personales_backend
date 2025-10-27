import { Router } from "express";  
import  gastosController  from "../controller/gastosController.js";

export const gastoRouter = Router();

// Endpoint para obtener todos los gastos
gastoRouter.get('/', gastosController.getAllGastos);

// Endpoint para obtener gastos filtrados por mes y año
gastoRouter.get('/:anyo/:mes', gastosController.getGastosByMonthYear);

// Endpoint para agregar un nuevo gasto
gastoRouter.post('/', gastosController.createGasto);

// Endpoint para actualizar un gasto existente
gastoRouter.put('/:id', gastosController.updateGasto);

// Endpoint para eliminar un gasto
gastoRouter.delete('/:id', gastosController.deleteGasto);

export default gastoRouter;

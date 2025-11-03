// src/routes/transaccionesRouter.js
import { Router } from 'express';
import TransaccionesController from '../controller/transaccionesController.js';

export const crearRouterTransacciones = (tipo) => {
  const router = Router();

  // Middleware que inyecta el tipo (ingreso o gasto)
  router.use((req, res, next) => {
    req.tipo = tipo;
    next();
  });

  router.get('/', TransaccionesController.getAll);
  router.get('/:anyo/:mes', TransaccionesController.getByMonthYear);
  router.post('/', TransaccionesController.create);
  router.put('/:id', TransaccionesController.update);
  router.delete('/:id', TransaccionesController.delete);

  return router;
};

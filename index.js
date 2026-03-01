import 'dotenv/config';
import express, { json } from 'express';
import { randomUUID } from 'crypto';
const app = express();
import { corsMiddleware } from './middelwares/cors.js';

// Middlewares
app.use(corsMiddleware);
app.use(express.json());
import { gastoRouter } from './router/gastosRouter.js';
import { ingresoRouter } from './router/ingresosRouter.js';
import { crearRouterTransacciones } from './router/transaccionesRouter.js';
import { categoriasRouter } from './router/categoriasRouter.js';
import { authRouter } from './router/AuthRouter.js';
import { usersRouter } from './router/usersRouter.js';
import { verifyToken } from './middelwares/auth.js';

// Rutas de autenticación
app.use('/auth', authRouter);


// Deshabilitar la cabecera 'X-Powered-By' por seguridad
app.disable('x-powered-by');



// ⭐ RUTAS
app.use('/ingresos',crearRouterTransacciones('ingreso'));
app.use('/gastos', crearRouterTransacciones('gasto')); 
app.use('/usuarios', usersRouter);
app.use('/categorias', categoriasRouter);


const PORT = process.env.PORT || 1234;

// ⭐ INICIA EL SERVIDOR CON EXPRESS DIRECTAMENTE
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})


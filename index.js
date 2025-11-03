import express, { json } from 'express';
import { randomUUID } from 'crypto';
const app = express();
import { corsMiddleware } from './middelwares/cors.js';

// Middlewares
app.use(corsMiddleware);
app.use(json());
import { gastoRouter } from './routes/gastosRouter.js';
import { ingresoRouter } from './routes/ingresosRouter.js';
import { crearRouterTransacciones } from './routes/transaccionesRouter.js';


// Deshabilitar la cabecera 'X-Powered-By' por seguridad
app.disable('x-powered-by');



// ⭐ RUTAS
app.use('/ingresos', crearRouterTransacciones('ingreso'));
app.use('/gastos', crearRouterTransacciones('gasto')); 


const PORT = process.env.PORT || 1234;

// ⭐ INICIA EL SERVIDOR CON EXPRESS DIRECTAMENTE
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})
import express, { json } from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';
const app = express();

import { gastoRouter } from './routes/gastos.js';
import { ingresoRouter } from './routes/ingresos.js';
import ingresos from './data/ingresos.json' with { type: 'json' };
import gastos from './data/gastos.json' with { type: 'json' };

// ⭐ ACTUALIZAR IMPORTS - Importar las funciones y categorías correctas
import {
  validateIngreso,
  validateGasto,
  categoriasIngresos,
  categoriasGastos
} from './schemas/movimientos.js';

// Deshabilitar la cabecera 'X-Powered-By' por seguridad
app.disable('x-powered-by');

// ⭐ MIDDLEWARES - EN ESTE ORDEN
app.use(json());
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

// ⭐ RUTAS
app.use('/gastos', gastoRouter);
app.use('/ingresos', ingresoRouter);  


const PORT = process.env.PORT || 1234;

// ⭐ INICIA EL SERVIDOR CON EXPRESS DIRECTAMENTE
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})
import 'dotenv/config';
import express from 'express';
import { corsMiddleware } from './middelwares/cors.js';
import { securityHeaders, apiLimiter } from './middelwares/securityMiddleware.js';
import { crearRouterTransacciones } from './router/transaccionesRouter.js';
import { categoriasRouter } from './router/categoriasRouter.js';
import { authRouter } from './router/AuthRouter.js';
import { usersRouter } from './router/usersRouter.js';
import { verifyToken } from './middelwares/auth.js';
import cookieParser from 'cookie-parser';
// import { authLimiter } from './middelwares/securityMiddleware.js';
const app = express();

// ─── Seguridad global ─────────────────────────────────────────────────────────
app.use(securityHeaders);       // Helmet con todos los headers
app.use(corsMiddleware);
app.use(cookieParser());
app.use(express.json());
app.disable('x-powered-by');    // Helmet ya lo hace, pero no hace daño dejarlo

// ─── Rutas de autenticación (con rate limiter específico) ─────────────────────
app.use('/auth', authRouter);

// ─── Rutas protegidas ─────────────────────────────────────────────────────────
app.use('/ingresos', verifyToken, crearRouterTransacciones('ingreso'));
app.use('/gastos', verifyToken, crearRouterTransacciones('gasto'));
app.use('/usuarios', verifyToken, usersRouter);
app.use('/categorias', categoriasRouter);

// Las rutas financieras también usan transactionLimiter donde aplique
// (ver punto 2 abajo)

const PORT = process.env.PORT || 1234;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';

// ─── Cliente Redis (para rate limiting distribuido) ───────────────────────────
const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.connect().catch(console.error);

// ─── Helmet con headers reforzados ───────────────────────────────────────────
export const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc:              ["'self'"],
            scriptSrc:               ["'self'"],
            styleSrc:                ["'self'"],
            fontSrc:                 ["'self'"],
            imgSrc:                  ["'self'", "data:"],
            connectSrc:              ["'self'"],
            frameSrc:                ["'none'"],
            objectSrc:               ["'none'"],
            baseUri:                 ["'none'"],    // Evita ataques con <base>
            formAction:              ["'self'"],    // Formularios solo a tu dominio
            frameAncestors:          ["'none'"],    // Equivalente a X-Frame-Options: DENY
            upgradeInsecureRequests: [],            // Fuerza HTTPS en recursos embebidos
        }
    },
    hsts: {
        maxAge:            31536000,
        includeSubDomains: true,
        preload:           true
    },
    referrerPolicy: {
        policy: 'strict-origin-when-cross-origin' // No filtra info sensible en referer
    },
    crossOriginOpenerPolicy:   { policy: 'same-origin' },   // Aísla ventanas entre origins
    crossOriginEmbedderPolicy: { policy: 'require-corp' },  // Evita carga de recursos no autorizados
    crossOriginResourcePolicy: { policy: 'same-origin' },   // Recursos solo accesibles desde tu origin
    permittedCrossDomainPolicies: { permittedPolicies: 'none' }, // Bloquea acceso desde Flash/PDF externos
    noSniff: true,       // X-Content-Type-Options: nosniff
    xssFilter: true,     // X-XSS-Protection (legacy browsers)
    hidePoweredBy: true  // Elimina el header X-Powered-By
});

// ─── Rate Limiter para autenticación ─────────────────────────────────────────
export const authLimiter = rateLimit({
    windowMs:              10 * 60 * 1000,  // 10 minutos
    max:                   5,
    skipSuccessfulRequests: true,           // Solo cuenta intentos FALLIDOS
    standardHeaders:       'draft-7',       // Usa RateLimit headers estándar
    legacyHeaders:         false,           // No expone X-RateLimit-* legacy
    store: new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
    }),
    handler: (_req, res) => {
        // Handler propio: no filtra stack traces ni info interna
        res.status(429).json({
            error: 'Demasiados intentos. Intenta de nuevo en 10 minutos.'
        });
    }
});

// ─── Rate Limiter para rutas generales de la API ─────────────────────────────
export const apiLimiter = rateLimit({
    windowMs:        60 * 1000,
    max:             60,
    standardHeaders: 'draft-7',
    legacyHeaders:   false,
    store: new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
    }),
    handler: (_req, res) => {
        res.status(429).json({
            error: 'Límite de solicitudes alcanzado. Intenta más tarde.'
        });
    }
});

// ─── Rate Limiter específico para operaciones financieras sensibles ───────────
export const transactionLimiter = rateLimit({
    windowMs:        60 * 60 * 1000,  // 1 hora
    max:             30,               // Máx 30 transacciones por hora
    standardHeaders: 'draft-7',
    legacyHeaders:   false,
    store: new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
    }),
    handler: (_req, res) => {
        res.status(429).json({
            error: 'Límite de operaciones alcanzado por seguridad.'
        });
    }
});
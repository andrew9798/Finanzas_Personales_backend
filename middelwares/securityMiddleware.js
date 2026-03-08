import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Helmet configura todos los headers de seguridad HTTP
export const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc:  ["'self'"],   // Bloquea scripts externos no autorizados
            styleSrc:   ["'self'"],
            imgSrc:     ["'self'", "data:"],
            connectSrc: ["'self'"],
            frameSrc:   ["'none'"],   // Bloquea iframes → evita clickjacking
            objectSrc:  ["'none'"]
        }
    },
    hsts: {
        maxAge: 31536000,        // 1 año obligando HTTPS
        includeSubDomains: true,
        preload: true
    }
});

// Rate limiting agresivo para app financiera
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,                      // Solo 5 intentos en 15 min (vs 10 normal)
    message: { error: 'Cuenta bloqueada temporalmente por seguridad' }
});

export const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60                      // 60 requests/min en rutas normales
});
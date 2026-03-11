import userModel from '../models/usersModel.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { validationResult } from 'express-validator';

// ─── Helpers privados ────────────────────────────────────────────────────────

const generateAccessToken = (user) =>
    jwt.sign(
        { id: user.id, tipo: user.tipo, nickname: user.nickname },
        process.env.JWT_SECRET,
        { expiresIn: '10m', issuer: process.env.JWT_ISSUER }
        // ↑ 10 min para app financiera (vs 15 min genérico)
    );

const generateRefreshToken = (user) =>
    jwt.sign(
        { id: user.id, sessionId: crypto.randomUUID() },
        // ↑ sessionId único por sesión → detectar robo de token
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '1d', issuer: process.env.JWT_ISSUER }
        // ↑ 1 día para app financiera (vs 7 días genérico)
    );

const COOKIE_OPTIONS = {
    httpOnly: true,     // JS nunca puede leer esta cookie → protege contra XSS
    secure: true,       // Solo HTTPS — siempre true en app financiera
    sameSite: 'strict', // Bloquea CSRF: la cookie no se envía desde otros dominios
    maxAge: 24 * 60 * 60 * 1000, // 1 día en ms
    path: '/api/auth'   // La cookie SOLO se envía a rutas de autenticación
};

// ─── Controller ──────────────────────────────────────────────────────────────

export default class AuthController {

    static async register(req, res) {
        try {
            // 1. Validaciones declarativas (ver authValidators.js)
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // 2. Renombrado: gmail→email, pass→password (nomenclatura estándar)
            const { nickname, email, password } = req.body;

            // 3. Verificar duplicados en paralelo (más eficiente)
            const [emailExiste, nicknameExiste] = await Promise.all([
                userModel.emailExists(email),
                userModel.nicknameExists(nickname)
            ]);

            if (emailExiste) return res.status(409).json({ error: 'El email ya está registrado' });
            if (nicknameExiste) return res.status(409).json({ error: 'El nickname ya está en uso' });

            // 4. Crear usuario
            const insertId = await userModel.create({ nickname, email, password });

            return res.status(201).json({
                message: 'Usuario registrado correctamente',
                id: insertId
            });

        } catch (error) {
            // NUNCA exponer error.message al cliente en producción
            console.error('[AuthController.register]', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    static async login(req, res) {
        // 1. Validaciones declarativas
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // 2. Buscar usuario en BD
        let user;
        try {
            user = await userModel.getByEmail(email);
        } catch (error) {
            console.error('[AuthController.login] Error al buscar usuario en BD:', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        // 3. Verificar contraseña
        let passwordValido;
        try {
            passwordValido = user
                ? await userModel.verifyPassword(password, user.pass)
                : false;
        } catch (error) {
            console.error('[AuthController.login] Error al verificar contraseña:', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        // 4. Mensaje genérico → evita user enumeration attack
        if (!user || !passwordValido) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        // 5. Actualizar último acceso
        try {
            await userModel.updateLastAccess(user.id);
        } catch (error) {
            // No es crítico — el login puede continuar aunque falle esto
            console.warn('[AuthController.login] No se pudo actualizar ultimo_acceso:', error);
        }

        // 6. Revocar sesiones anteriores
        try {
            await userModel.revokeAllRefreshTokens(user.id);
        } catch (error) {
            console.error('[AuthController.login] Error al revocar sesiones anteriores:', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        // 7. Generar tokens
        let accessToken, refreshToken;
        try {
            accessToken = generateAccessToken(user);
            refreshToken = generateRefreshToken(user);
        } catch (error) {
            console.error('[AuthController.login] Error al generar tokens JWT:', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        // 8. Guardar refresh token en BD
        try {
            await userModel.saveRefreshToken(user.id, refreshToken);
        } catch (error) {
            console.error('[AuthController.login] Error al guardar refresh token en BD:', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        // 9. Enviar cookie y respuesta
        try {
            res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

            return res.status(200).json({
                accessToken,
                user: {
                    id: user.id,
                    nickname: user.nickname,
                    email: user.email,
                    tipo: user.tipo
                }
            });
        } catch (error) {
            console.error('[AuthController.login] Error al enviar respuesta:', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    static async refresh(req, res) {
        try {
            // 1. El refresh token viene de la cookie httpOnly (no del body)
            const refreshToken = req.cookies?.refreshToken;
            if (!refreshToken) {
                return res.status(401).json({ error: 'Sesión no encontrada' });
            }

            // 2. Verificar firma y expiración
            let decoded;
            try {
                decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, {
                    issuer: process.env.JWT_ISSUER
                });
            } catch (err) {
                // Limpiar cookie inválida
                res.clearCookie('refreshToken', COOKIE_OPTIONS);
                return res.status(401).json({ error: 'Sesión inválida o expirada' });
            }

            // 3. Verificar que el token existe en BD (no fue revocado en logout)
            const user = await userModel.findByRefreshToken(decoded.id, refreshToken);
            if (!user) {
                // Posible robo de token: alguien usó un refresh token ya revocado
                res.clearCookie('refreshToken', COOKIE_OPTIONS);
                console.warn('[AuthController.refresh] Posible robo de token, userId:', decoded.id);
                return res.status(401).json({ error: 'Sesión revocada' });
            }

            // 4. Rotar el refresh token en cada uso (buena práctica de seguridad)
            //    Si el token antiguo se usa de nuevo → detectamos robo
            const newAccessToken = generateAccessToken(user);
            const newRefreshToken = generateRefreshToken(user);

            await userModel.saveRefreshToken(user.id, newRefreshToken);
            res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);

            return res.status(200).json({ accessToken: newAccessToken });

        } catch (error) {
            console.error('[AuthController.refresh]', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    }

    static async logout(req, res) {
        try {
            const refreshToken = req.cookies?.refreshToken;

            if (refreshToken) {
                // Revocar en BD → el token queda invalidado server-side
                // (antes el logout no hacía nada real)
                const decoded = jwt.decode(refreshToken);
                if (decoded?.id) {
                    await userModel.revokeAllRefreshTokens(decoded.id);

                    // Log de auditoría del logout
                    await userModel.saveAuditLog({
                        userId: decoded.id,
                        action: 'LOGOUT',
                        ip: req.ip,
                        userAgent: req.headers['user-agent'],
                        timestamp: new Date()
                    });
                }
            }

            // Eliminar la cookie del navegador
            res.clearCookie('refreshToken', COOKIE_OPTIONS);
            return res.status(200).json({ message: 'Sesión cerrada correctamente' });

        } catch (error) {
            console.error('[AuthController.logout]', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
}
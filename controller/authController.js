import userModel from '../models/usersModel.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { validationResult } from 'express-validator';

const generateAccessToken = (user) =>
    jwt.sign(
        { id: user.id, tipo: user.tipo, nickname: user.nickname },
        process.env.JWT_SECRET,
        { expiresIn: '10m', issuer: process.env.JWT_ISSUER }
    );

const generateRefreshToken = (user) =>
    jwt.sign(
        { id: user.id, sessionId: crypto.randomUUID() },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '1d', issuer: process.env.JWT_ISSUER }
    );

const COOKIE_OPTIONS = {
    httpOnly: true,
    path: '/',
    secure: false, // Cambiar a true en producción con HTTPS
    sameSite: 'lax', // Permite cookies en contextos cross-site (para desarrollo local)
    maxAge: 24 * 60 * 60 * 1000
};

export default class AuthController {
    static async register(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

            const { nickname, email, password } = req.body;
            const [emailExiste, nicknameExiste] = await Promise.all([
                userModel.emailExists(email),
                userModel.nicknameExists(nickname)
            ]);

            if (emailExiste) return res.status(409).json({ error: 'El email ya está registrado' });
            if (nicknameExiste) return res.status(409).json({ error: 'El nickname ya está en uso' });

            const insertId = await userModel.create({ nickname, email, password });
            return res.status(201).json({ message: 'Usuario registrado', id: insertId });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error interno' });
        }
    }

    static async login(req, res) {
        const { email, password } = req.body;
        try {
            const user = await userModel.getByEmail(email);
            const passwordValido = user ? await userModel.verifyPassword(password, user.password) : false;

            if (!user || !passwordValido) return res.status(401).json({ error: 'Credenciales incorrectas' });

            await userModel.updateLastAccess(user.id);
            await userModel.revokeAllRefreshTokens(user.id);

            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

            await userModel.saveRefreshToken(user.id, refreshToken);
            res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

            return res.status(200).json({
                accessToken,
                user: { id: user.id, nickname: user.nickname, email: user.email, tipo: user.tipo }
            });
        } catch (error) {
            return res.status(500).json({ error: 'Error interno' });
        }
    }

    static async refresh(req, res) {
        console.log('=== REFRESH DEBUG ===');
        console.log('Cookie header RAW:', req.headers.cookie);
        console.log('req.cookies:', req.cookies);
        console.log('Origin:', req.headers.origin);
        console.log('====================');
        try {
            const refreshToken = req.cookies?.refreshToken;
            console.log("Intentando refrescar token con:", refreshToken);
            if (!refreshToken) {
                console.log("No se proporcionó token de refresco");
                return res.status(401).json({ error: 'No se proporcionó token de refresco' });
            }
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            const user = await userModel.findByRefreshToken(decoded.id, refreshToken);

            if (!user) {
                res.clearCookie('refreshToken', COOKIE_OPTIONS);
                console.log("session no valida para token:", refreshToken);
                return res.status(401).json({ error: 'Sesión no válida' });
            }

            const newAccessToken = generateAccessToken(user);
            const newRefreshToken = generateRefreshToken(user);

            await userModel.saveRefreshToken(user.id, newRefreshToken);
            res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);

            // 🚩 Corregido: Ahora devuelve también el objeto user
            return res.status(200).json({
                accessToken: newAccessToken,
                user: { id: user.id, nickname: user.nickname, email: user.email, tipo: user.tipo }
            });
            console.log('Refresh exitoso para usuario:', user.nickname);
        } catch (error) {
            return res.status(401).json({ error: 'Token expirado' });
            console.log("token expirado:", refreshToken);

        }
    }

    static async logout(req, res) {
        const refreshToken = req.cookies?.refreshToken;
        if (refreshToken) {
            const decoded = jwt.decode(refreshToken);
            if (decoded?.id) await userModel.revokeAllRefreshTokens(decoded.id);
        }
        res.clearCookie('refreshToken', COOKIE_OPTIONS);
        return res.status(200).json({ message: 'Sesión cerrada' });
    }
}
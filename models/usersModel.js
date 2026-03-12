import connection from "../data/Connection.js";
import { randomUUID } from 'crypto';
import bcrypt from "bcrypt";

export default class userModel {
    // Obtener todos los usuarios por tipo
    static async getAll() {
        const [rows] = await connection.query(
            `SELECT
                id,
                nickname,
                email,
                tipo,
                fecha_creacion,
                ultimo_acceso
            FROM usuarios`,
        );
        return rows;
    }

    static async getAllByType(tipo) {
        const [rows] = await connection.query(
            `SELECT
                id,
                nickname,
                email,
                tipo,
                fecha_creacion,
                ultimo_acceso
            FROM usuarios
            WHERE tipo = ?`,
            [tipo]
        );
        return rows;
    }

    // Obtener usuario por ID (para dashboard)
    static async getById(id) {
        const [rows] = await connection.query(
            `SELECT
                id,
                nickname,
                email,
                tipo,
                fecha_creacion,
                ultimo_acceso
            FROM usuarios
            WHERE id = ?`,
            [id]
        );
        return rows[0];
    }

    // Obtener usuario por email
    static async getByEmail(email) {
        const [rows] = await connection.query(
            `SELECT
                id,
                nickname,
                email,
                password,
                tipo,
                fecha_creacion,
                ultimo_acceso
            FROM usuarios
            WHERE email = ?`,
            [email]
        );
        return rows[0];
    }

    // Obtener usuario por nickname
    static async getByNickname(nickname) {
        const [rows] = await connection.query(
            `SELECT
                id,
                nickname,
                email,
                tipo
            FROM usuarios
            WHERE nickname = ?`,
            [nickname]
        );
        return rows[0];
    }

// Crear nuevo usuario (registro)
static async create(userData) {
    const { nickname, email, password, tipo = 'usuario' } = userData;

    const id = randomUUID(); // ← generar UUID
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await connection.query(
        `INSERT INTO usuarios (id, nickname, email, password, tipo, fecha_creacion)
        VALUES (?, ?, ?, ?, ?, NOW())`,
        [id, nickname, email, hashedPassword, tipo] // ← id como primer parámetro
    );

    return id; // ← devolver el UUID, no result.insertId
}

    // Verificar contraseña (para login)
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // Actualizar información del usuario
    static async update(id, userData) {
        const { nickname, email } = userData;
        
        await connection.query(
            `UPDATE usuarios
            SET nickname = ?, email = ?
            WHERE id = ?`,
            [nickname, email, id]
        );

        return true;
    }

    // Cambiar contraseña
    static async updatePassword(id, newPassword) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        await connection.query(
            `UPDATE usuarios
            SET password = ?
            WHERE id = ?`,
            [hashedPassword, id]
        );

        return true;
    }

    // Actualizar último acceso
    static async updateLastAccess(id) {
        await connection.query(
            `UPDATE usuarios
            SET ultimo_acceso = NOW()
            WHERE id = ?`,
            [id]
        );
    }

    // Eliminar usuario
    static async delete(id) {
        await connection.query(
            `DELETE FROM usuarios
            WHERE id = ?`,
            [id]
        );
        return true;
    }

    // Verificar si existe un email
    static async emailExists(email) {
        const [rows] = await connection.query(
            `SELECT id FROM usuarios WHERE email = ?`,
            [email]
        );
        return rows.length > 0;
    }

    // Verificar si existe un nickname
    static async nicknameExists(nickname) {
        const [rows] = await connection.query(
            `SELECT id FROM usuarios WHERE nickname = ?`,
            [nickname]
        );
        return rows.length > 0;
    }

    // ─── REFRESH TOKENS ──────────────────────────────────────────────────────

    // Guarda un nuevo refresh token — sobreescribe el anterior del usuario
    static async saveRefreshToken(userId, token) {
        // Calculamos la fecha de expiración (1 día)
        const expiraEn = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await connection.query(
            `INSERT INTO refresh_tokens (id_usuario, token, expira_en)
             VALUES (?, ?, ?)`,
            [userId, token, expiraEn]
        );
    }

    // Busca un refresh token válido y devuelve el usuario asociado
    // Verifica que el token no haya expirado en BD (doble seguridad además del JWT)
    static async findByRefreshToken(userId, token) {
        const [rows] = await connection.query(
            `SELECT u.id, u.nickname, u.email AS email, u.tipo
             FROM refresh_tokens rt
             JOIN usuarios u ON u.id = rt.id_usuario
             WHERE rt.id_usuario = ?
               AND rt.token = ?
               AND rt.expira_en > NOW()`,
            [userId, token]
        );
        return rows[0];
    }

    // Revoca todas las sesiones activas de un usuario
    // Se llama en login (sesión única) y en logout
    static async revokeAllRefreshTokens(userId) {
        await connection.query(
            `DELETE FROM refresh_tokens WHERE id_usuario = ?`,
            [userId]
        );
    }

    // Obtener estadísticas del usuario (para dashboard)
    static async getUserStats(id) {
        const [rows] = await connection.query(
            `SELECT
                COUNT(*) as total_actividades,
                DATE(fecha_creacion) as miembro_desde
            FROM usuarios
            WHERE id = ?`,
            [id]
        );
        return rows[0];
    }
}
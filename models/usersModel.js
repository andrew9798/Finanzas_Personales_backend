import connection from "../data/Connection.js";
import bcrypt from "bcrypt";

export default class userModel {
    // Obtener todos los usuarios por tipo
    static async getAll(tipo) {
        const [rows] = await connection.query(
            `SELECT
                id,
                nickname,
                gmail,
                tipo,
                fecha_registro,
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
                gmail,
                tipo,
                fecha_registro,
                ultimo_acceso
            FROM usuarios
            WHERE id = ?`,
            [id]
        );
        return rows[0];
    }

    // Obtener usuario por email
    static async getByEmail(gmail) {
        const [rows] = await connection.query(
            `SELECT
                id,
                nickname,
                gmail,
                pass,
                tipo,
                fecha_registro,
                ultimo_acceso
            FROM usuarios
            WHERE gmail = ?`,
            [gmail]
        );
        return rows[0];
    }

    // Obtener usuario por nickname
    static async getByNickname(nickname) {
        const [rows] = await connection.query(
            `SELECT
                id,
                nickname,
                gmail,
                tipo
            FROM usuarios
            WHERE nickname = ?`,
            [nickname]
        );
        return rows[0];
    }

    // Crear nuevo usuario (registro)
    static async create(userData) {
        const { nickname, gmail, pass, tipo = 'usuario' } = userData;
        
        // Encriptar contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(pass, saltRounds);

        const [result] = await connection.query(
            `INSERT INTO usuarios (nickname, gmail, pass, tipo, fecha_registro)
            VALUES (?, ?, ?, ?, NOW())`,
            [nickname, gmail, hashedPassword, tipo]
        );

        return result.insertId;
    }

    // Verificar contraseña (para login)
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // Actualizar información del usuario
    static async update(id, userData) {
        const { nickname, gmail } = userData;
        
        await connection.query(
            `UPDATE usuarios
            SET nickname = ?, gmail = ?
            WHERE id = ?`,
            [nickname, gmail, id]
        );

        return true;
    }

    // Cambiar contraseña
    static async updatePassword(id, newPassword) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        await connection.query(
            `UPDATE usuarios
            SET pass = ?
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
    static async emailExists(gmail) {
        const [rows] = await connection.query(
            `SELECT id FROM usuarios WHERE gmail = ?`,
            [gmail]
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

    // Obtener estadísticas del usuario (para dashboard)
    static async getUserStats(id) {
        const [rows] = await connection.query(
            `SELECT
                COUNT(*) as total_actividades,
                DATE(fecha_registro) as miembro_desde
            FROM usuarios
            WHERE id = ?`,
            [id]
        );
        return rows[0];
    }
}
// models/transaccionesModel.js
import connection from '../data/Connection.js';
import { randomUUID } from 'crypto';

export default class TransaccionesModel {

    // 🚩 Añadido id_usuario para filtrar la lista
    static async getAll(tipo, id_usuario) {
        const [rows] = await connection.query(
            `SELECT 
                t.id, t.id_usuario, t.tipo, t.concepto, 
                t.cantidad, t.id_categoria, c.nombre AS categoria, t.fecha
            FROM transacciones t
            LEFT JOIN categorias c ON t.id_categoria = c.id
            WHERE t.tipo = ? AND t.id_usuario = ?`, // 🚩 Filtro de propiedad
            [tipo, id_usuario]
        );

        return rows.map(row => ({
            ...row,
            fecha: new Date(row.fecha).toISOString().split('T')[0], // Formato YYYY-MM-DD simple
            cantidad: parseFloat(row.cantidad)
        }));
    }

    // 🚩 Añadido id_usuario para filtrar por mes/año de forma segura
    static async getByMonthYear(tipo, anyo, mes, id_usuario) {
        const [rows] = await connection.query(
            `SELECT 
                t.id, t.id_usuario, t.tipo, t.concepto, 
                t.cantidad, t.id_categoria, c.nombre AS categoria, t.fecha
            FROM transacciones t
            LEFT JOIN categorias c ON t.id_categoria = c.id
            WHERE t.tipo = ? 
                AND t.id_usuario = ? 
                AND YEAR(fecha) = ? 
                AND MONTH(fecha) = ?`, // 🚩 Filtro de propiedad
            [tipo, id_usuario, anyo, mes]
        );

        return rows.map(row => ({
            ...row,
            fecha: new Date(row.fecha).toISOString().split('T')[0],
            cantidad: parseFloat(row.cantidad)
        }));
    }

    // Este lo dejamos así porque el controlador ya verifica la propiedad después de obtenerlo
    static async getById(id) {
        const [rows] = await connection.query(
            `SELECT 
                t.id, t.id_usuario, t.tipo, t.concepto, 
                t.cantidad, t.id_categoria, c.nombre AS categoria, t.fecha
            FROM transacciones t
            LEFT JOIN categorias c ON t.id_categoria = c.id
            WHERE t.id = ?`,
            [id]
        );

        if (rows.length === 0) return null;

        const transaccion = { ...rows[0] };
        transaccion.cantidad = parseFloat(transaccion.cantidad);
        return transaccion;
    }

    static async getCategoriaIdByNombre(nombre, tipo) {
        const [rows] = await connection.query(
            `SELECT id FROM categorias WHERE nombre = ? AND tipo = ?`,
            [nombre, tipo]
        );
        return rows.length > 0 ? rows[0].id : null;
    }

    static async create(data) {
        // Usamos el ID generado en el controlador o lo generamos aquí si no viene
        const id = data.id || randomUUID();
        const { id_usuario, tipo, concepto, cantidad, id_categoria, fecha } = data;
        
        await connection.query(
            `INSERT INTO transacciones (id, id_usuario, tipo, concepto, cantidad, id_categoria, fecha)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, id_usuario, tipo, concepto, cantidad, id_categoria, fecha]
        );

        return { id, ...data };
    }

    static async update(id, data) {
        const columnasPermitidas = ['concepto', 'cantidad', 'id_categoria', 'fecha'];
        const datosValidos = {};
        
        for (const [key, value] of Object.entries(data)) {
            if (columnasPermitidas.includes(key)) {
                datosValidos[key] = value;
            }
        }

        if (Object.keys(datosValidos).length === 0) {
            throw new Error('No hay campos válidos para actualizar');
        }

        const fields = Object.keys(datosValidos).map(key => `${key} = ?`).join(', ');
        const values = Object.values(datosValidos);

        await connection.query(
            `UPDATE transacciones SET ${fields} WHERE id = ?`,
            [...values, id]
        );

        return { id, ...datosValidos };
    }

    static async delete(id) {
        await connection.query(
            `DELETE FROM transacciones WHERE id = ?`,
            [id]
        );
        return { message: `Transacción ${id} eliminada.` };
    }
}
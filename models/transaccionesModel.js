// models/transaccionesModel.js
import connection from '../data/Connection.js';
import { randomUUID } from 'crypto';

export default class TransaccionesModel {

    static async getAll(tipo) {
        const [rows] = await connection.query(
            `SELECT 
                t.id,
                t.id_usuario,
                t.tipo, 
                t.concepto, 
                t.cantidad, 
                t.id_categoria,
                c.nombre AS categoria,
                t.fecha
            FROM transacciones t
            LEFT JOIN categorias c ON t.id_categoria = c.id
            WHERE t.tipo = ?`,
            [tipo]
        );

        return rows.map(row => {
            const fecha = new Date(row.fecha);
            const año = fecha.getFullYear();
            const mes = String(fecha.getMonth() + 1).padStart(2, '0');
            const dia = String(fecha.getDate()).padStart(2, '0');

            return {
                ...row,
                fecha: `${año}-${mes}-${dia}`,
                cantidad: parseFloat(row.cantidad)
            };
        });
    }

    static async getByMonthYear(tipo, anyo, mes) {
        const [rows] = await connection.query(
            `SELECT 
                t.id,
                t.id_usuario,
                t.tipo, 
                t.concepto, 
                t.cantidad, 
                t.id_categoria,
                c.nombre AS categoria,
                t.fecha
            FROM transacciones t
            LEFT JOIN categorias c ON t.id_categoria = c.id
            WHERE t.tipo = ?
                AND YEAR(fecha) = ?
                AND MONTH(fecha) = ?`,
            [tipo, anyo, mes]
        );

        return rows.map(row => {
            const fecha = new Date(row.fecha);
            const año = fecha.getFullYear();
            const mes = String(fecha.getMonth() + 1).padStart(2, '0');
            const dia = String(fecha.getDate()).padStart(2, '0');

            return {
                ...row,
                fecha: `${año}-${mes}-${dia}`,
                cantidad: parseFloat(row.cantidad)
            };
        });
    }

    static async getById(id) {
        const [rows] = await connection.query(
            `SELECT 
                t.id,
                t.id_usuario,
                t.tipo, 
                t.concepto, 
                t.cantidad, 
                t.id_categoria,
                c.nombre AS categoria,
                t.fecha
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
        const id = randomUUID();
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

        const fields = Object.keys(datosValidos)
            .map(key => `${key} = ?`)
            .join(', ');
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
        return { message: `Transacción ${id} eliminada correctamente.` };
    }
}
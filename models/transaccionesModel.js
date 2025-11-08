// models/transaccionesModel.js
import connection from '../data/Connection.js';
import { randomUUID } from 'crypto';

export default class TransaccionesModel {

    // ✅ Obtener todas las transacciones por tipo (ingreso o gasto)
    static async getAll(tipo) {
        const [rows] = await connection.query(
            `SELECT 
     BIN_TO_UUID(t.id) AS id,
     BIN_TO_UUID(t.id_usuario) AS id_usuario,
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
        return rows;
    }

    // ✅ Filtrar por mes y año
    static async getByMonthYear(tipo, anyo, mes) {
        const [rows] = await connection.query(
            `SELECT 
         BIN_TO_UUID(t.id) AS id,
     BIN_TO_UUID(t.id_usuario) AS id_usuario,
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
        return rows;
    }

    // Método para buscar id_categoria por nombre
static async getCategoriaIdByNombre(nombre, tipo) {
    const [rows] = await connection.query(
        `SELECT id FROM categorias WHERE nombre = ? AND tipo = ?`,
        [nombre, tipo]
    );
    
    return rows.length > 0 ? rows[0].id : null;
}

    // ✅ Crear nueva transacción
    static async create(data) {
        const id = randomUUID();
        const { id_usuario, tipo, concepto, cantidad, id_categoria, fecha } = data;
        await connection.query(
            `INSERT INTO transacciones (id, id_usuario, tipo, concepto, cantidad, id_categoria, fecha)
   VALUES (UUID_TO_BIN(?), UUID_TO_BIN(?), ?, ?, ?, ?, ?)`,
            [id, id_usuario, tipo, concepto, cantidad, id_categoria, fecha]
        );

        return { id, ...data };
    }

    // ✅ Actualizar transacción
    static async update(id, data) {
        // Generar dinámicamente los campos a actualizar
        const fields = Object.keys(data)
            .map(key => `${key} = ?`)
            .join(', ');
        const values = Object.values(data);

        await connection.query(
            `UPDATE transacciones SET ${fields} WHERE id = UUID_TO_BIN(?)`,
            [...values, id]
        );

        return { id, ...data };
    }

    // ✅ Eliminar transacción
    static async delete(id) {
        await connection.query(
            `DELETE FROM transacciones WHERE id = UUID_TO_BIN(?)`,
            [id]
        );
        return { message: `Transacción ${id} eliminada correctamente.` };
    }
}

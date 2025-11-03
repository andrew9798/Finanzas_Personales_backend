// models/transaccionesModel.js
import pool from '../database/connection.js'; // conexión a MySQL
import { randomUUID } from 'crypto';

export default class TransaccionesModel {

  // Obtener todas las transacciones por tipo (ingreso/gasto)
  static async getAll(tipo) {
    const [rows] = await pool.query('SELECT * FROM transacciones WHERE tipo = ?', [tipo]);
    return rows;
  }

  // Filtrar por mes y año
  static async getByMonthYear(tipo, anyo, mes) {
    const [rows] = await pool.query(
      `SELECT * FROM transacciones 
       WHERE tipo = ? 
       AND YEAR(fecha) = ? 
       AND MONTH(fecha) = ?`,
      [tipo, anyo, mes]
    );
    return rows;
  }

  // Crear nueva transacción
  static async create(data) {
    const id = randomUUID();
    const { id_usuario, tipo, concepto, cantidad, categoria, fecha } = data;
    await pool.query(
      `INSERT INTO transacciones (id, id_usuario, tipo, concepto, cantidad, categoria, fecha)
       VALUES (UUID_TO_BIN(?), UUID_TO_BIN(?), ?, ?, ?, ?, ?)`,
      [id, id_usuario, tipo, concepto, cantidad, categoria, fecha]
    );
    return { id, ...data };
  }

  // Actualizar transacción
  static async update(id, data) {
    await pool.query(
      `UPDATE transacciones SET ? WHERE id = UUID_TO_BIN(?)`,
      [data, id]
    );
  }

  // Eliminar transacción
  static async delete(id) {
    await pool.query(
      `DELETE FROM transacciones WHERE id = UUID_TO_BIN(?)`,
      [id]
    );
  }
}
